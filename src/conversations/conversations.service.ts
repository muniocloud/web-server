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
  EmitMessageInput,
  HandleAIMessageProcessingInput,
  HandleSendMessageInput,
  SaveMessageInput,
  UploadAudioInput,
} from './dtos/conversations.service.dtos';
import { ConversationsContext } from './dtos/conversations.dtos';
import {
  conversationMessagesSchema,
  generativeResponseFeedbackOverallSchemaValidator,
  generativeResponseFeedbackSchemaValidator,
} from './validators/generative-content.validators';
import { WS_CONVERSATION_STATUS } from './enums/ws.enums';
import { avgRatingCalculator } from 'src/common/util/avg-rating-calculator';

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

    return this.handleAIMessageProcessing(
      {
        conversationId,
        message: nextMessage,
      },
      context,
    );
  }

  async handleAIMessageProcessing(
    { conversationId, message }: HandleAIMessageProcessingInput,
    context: ConversationsContext,
  ) {
    this.emitConversationStatus(
      WS_CONVERSATION_STATUS.PROCESSING_MESSAGE,
      context.socket,
    );

    const audio = await this.ttsService.speechToText(message.message);

    const audioUrl = await this.uploadAudio(
      {
        audio: audio,
        mimetype: 'audio/mpeg',
      },
      context,
    );

    this.emitMessage(
      {
        audioUrl,
        message,
      },
      context,
    );

    await this.saveMessage(
      {
        audioUrl,
        conversationId,
        conversationMessageId: message.id,
        feedback: 'audio generated',
        rating: 10,
      },
      context,
    );

    this.emitConversationStatus(
      WS_CONVERSATION_STATUS.MESSAGE_PROCESSED,
      context.socket,
    );

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

    const rating = +avgRatingCalculator(feedbacksMessages).toFixed(2);

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

    const audioUrl = await this.uploadAudio(
      {
        audio: input.audio,
        mimetype: input.mimetype,
      },
      context,
    );

    this.emitMessage(
      {
        audioUrl,
        message: nextMessage,
      },
      context,
    );

    const model = this.aiService.getAnswerAnalyserModel(nextMessage.message);

    const data = await this.aiService.generateContent(
      [
        this.aiService.createFilePart({
          buffer: input.audio,
          mimetype: input.mimetype,
        }),
      ],
      generativeResponseFeedbackSchemaValidator,
      model,
    );

    await this.saveMessage(
      {
        audioUrl,
        conversationId: input.conversationId,
        conversationMessageId: nextMessage.id,
        feedback: data.feedback,
        rating: data.rating,
      },
      context,
    );

    this.emitConversationStatus(
      WS_CONVERSATION_STATUS.MESSAGE_PROCESSED,
      context.socket,
    );

    return this.handleNextMessage(input.conversationId, context);
  }

  private async saveMessage(
    { feedback, rating, conversationMessageId, audioUrl }: SaveMessageInput,
    context: ConversationsContext,
  ) {
    await this.conversationsRepository.addConversationMessageResponse(
      {
        audioUrl,
        conversationMessageId,
        feedback,
        rating,
      },
      context,
    );
  }

  private async uploadAudio(
    { audio, mimetype = 'audio/mpeg' }: UploadAudioInput,
    _context: ConversationsContext,
  ) {
    const audioUrl = await this.uploadService.upload(
      {
        buffer: audio,
        mimetype,
      },
      'conversation-audio',
    );

    return audioUrl;
  }

  private emitMessage(
    { audioUrl, message }: EmitMessageInput,
    context: ConversationsContext,
  ) {
    context.socket?.emit('message', {
      ...message,
      audioUrl,
    });
  }
}
