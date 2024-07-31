import { Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';
import { ConversationsRepository } from './conversations.repository';
import { WsException } from '@nestjs/websockets';
import { TTSService } from 'src/tts/tts.service';
import { UploadService } from 'src/upload/upload.service';
import { Socket } from 'socket.io';
import { DURATION_LABEL, LEVEL_LABEL, STATUS } from 'src/common/enums';
import {
  CreateConversationInput,
  HandleSendMessageInput,
  SpeechAndSaveMessageInput,
  UploadAndSaveMessageInput,
} from './dtos/conversations.service.dtos';
import { ConversationsContext } from './dtos/conversations.dtos';
import {
  conversationMessagesSchema,
  generativeResponseFeedbackOverallSchemaValidator,
  generativeResponseFeedbackSchemaValidator,
} from './validators/generative-content.validators';
import { WS_CONVERSATION_STATUS } from './enums/ws.enums';
import { avgCalculator } from 'src/common/util/avg-calculator';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly aiService: AiService,
    private readonly ttsService: TTSService,
    private readonly uploadService: UploadService,
  ) {}

  async createConversation(
    input: CreateConversationInput,
    context: ConversationsContext,
  ) {
    const level = LEVEL_LABEL[input.level];
    const duration = DURATION_LABEL[input.duration];

    const model = this.aiService.getConversationsGeneratorModel();

    const title = `Conversation about ${input.context} on level ${level}`;

    const messages = await this.aiService.generateContent(
      [`Level: ${level}; Context: ${input.context}; Duration: ${duration}.`],
      conversationMessagesSchema,
      model,
    );

    return this.conversationsRepository.createConversation(
      {
        ...input,
        messages,
        title,
        status: STATUS.CREATED,
      },
      context,
    );
  }

  async getConversation(conversationId: number, context: ConversationsContext) {
    const conversation = await this.conversationsRepository.getConversation(
      conversationId,
      context,
    );

    if (!conversation) {
      throw new WsException('Conversation not found');
    }

    return conversation;
  }

  async getFullConversation(
    conversationId: number,
    context: ConversationsContext,
  ) {
    const conversation = await this.conversationsRepository.getFullConversation(
      conversationId,
      context,
    );

    if (!conversation) {
      if (context.isController) {
        throw new NotFoundException('Conversation not found');
      }

      throw new WsException('Conversation not found');
    }

    return conversation;
  }

  private async getNextMessage(
    conversationId: number,
    context: ConversationsContext,
  ) {
    const nextMessage = await this.conversationsRepository.getNextMessage(
      conversationId,
      context,
    );

    return nextMessage;
  }

  async handleSetupConversation(
    conversationId: number,
    context: ConversationsContext,
  ) {
    const conversation = await this.getConversation(conversationId, context);

    if (conversation.status === STATUS.FINISHED) {
      context.socket?.disconnect(true);
      return;
    }

    if (conversation.status === STATUS.CREATED) {
      await this.conversationsRepository.updateConversation(
        {
          id: conversationId,
          status: STATUS.STARTED,
        },
        context,
      );

      this.emitConversationStatus(
        WS_CONVERSATION_STATUS.STARTED,
        context.socket,
      );
    }

    return this.handleNextMessage(conversationId, context);
  }

  emitConversationStatus(status: number, socket?: Socket, ...extraData) {
    socket?.emit('status', status, extraData);
  }

  async handleNextMessage(
    conversationId: number,
    context: ConversationsContext,
  ) {
    const nextMessage = await this.getNextMessage(conversationId, context);

    if (!nextMessage) {
      return this.finishConversation(conversationId, context);
    }

    if (nextMessage.isUser) {
      context.socket?.emit('request-message', nextMessage);
      return;
    }

    this.emitConversationStatus(
      WS_CONVERSATION_STATUS.PROCESSING_MESSAGE,
      context.socket,
    );

    const audioUrl = await this.speechAndSaveMessage(
      {
        conversationId: conversationId,
        message: nextMessage,
      },
      context,
    );

    context.socket?.emit('message', {
      ...nextMessage,
      audioUrl,
    });

    return this.handleNextMessage(conversationId, context);
  }

  async finishConversation(
    conversationId: number,
    context: ConversationsContext,
  ) {
    this.emitConversationStatus(
      WS_CONVERSATION_STATUS.FINISHING,
      context.socket,
    );

    const feedbacksMessages =
      await this.conversationsRepository.getUserConversationMessages(
        conversationId,
        context,
      );

    const model = this.aiService.getConversationAnalyserModel();

    const feedback = await this.aiService.generateContent(
      [
        'Feedbacks:',
        ...feedbacksMessages.map(
          (lesson, index) => `${index}. "${lesson.feedback}""`,
        ),
      ],
      generativeResponseFeedbackOverallSchemaValidator,
      model,
    );

    const rating = +avgCalculator(feedbacksMessages).toFixed(2);

    const conversationFeedback = {
      feedback,
      rating,
    };

    await this.conversationsRepository.createConversationFeedback(
      {
        conversationId: conversationId,
        feedback,
        rating,
      },
      context,
    );

    await this.conversationsRepository.updateConversation(
      {
        id: conversationId,
        status: STATUS.FINISHED,
      },
      context,
    );

    this.emitConversationStatus(
      WS_CONVERSATION_STATUS.FINISHED,
      context.socket,
      conversationFeedback,
    );

    context.socket?.disconnect();
  }

  async handleSendMessage(
    input: HandleSendMessageInput,
    context: ConversationsContext,
  ) {
    this.emitConversationStatus(
      WS_CONVERSATION_STATUS.PROCESSING_MESSAGE,
      context.socket,
    );

    const conversation = await this.getConversation(
      input.conversationId,
      context,
    );

    if (conversation.status !== STATUS.STARTED) {
      context.socket?.disconnect();
      return;
    }

    const nextMessage = await this.getNextMessage(
      input.conversationId,
      context,
    );

    if (!nextMessage) {
      throw new WsException(
        'Sorry, something is wrong with this conversation.',
      );
    }

    const model = this.aiService.getAudioMessageAnalyserModel();

    const data = await this.aiService.generateContent(
      [
        nextMessage.message,
        this.aiService.createFilePart({
          buffer: input.audio,
          mimetype: input.mimetype,
        }),
      ],
      generativeResponseFeedbackSchemaValidator,
      model,
    );

    const audioUrl = await this.uploadAndSaveMessage(
      {
        audio: input.audio,
        mimetype: input.mimetype,
        conversationId: input.conversationId,
        conversationMessageId: nextMessage.id,
        feedback: data.feedback,
        rating: data.rating,
      },
      context,
    );

    context.socket?.emit('message', {
      ...nextMessage,
      audioUrl,
    });

    return this.handleNextMessage(input.conversationId, context);
  }

  private async speechAndSaveMessage(
    { conversationId, message }: SpeechAndSaveMessageInput,
    context: ConversationsContext,
  ) {
    const audio = await this.ttsService.speechToText(message.message);
    const audioUrl = await this.uploadAndSaveMessage(
      {
        audio,
        conversationMessageId: message.id,
        conversationId,
        feedback: 'generated',
        rating: 10,
      },
      context,
    );

    return audioUrl;
  }

  private async uploadAndSaveMessage(
    {
      audio,
      mimetype = 'audio/mpeg',
      feedback,
      rating,
      conversationMessageId,
    }: UploadAndSaveMessageInput,
    context: ConversationsContext,
  ) {
    const audioUrl = await this.uploadService.upload(
      {
        buffer: audio,
        mimetype,
      },
      'conversation-audio',
    );

    await this.conversationsRepository.addConversationMessageResponse(
      {
        audioUrl,
        conversationMessageId,
        feedback,
        rating,
      },
      context,
    );

    return audioUrl;
  }
}
