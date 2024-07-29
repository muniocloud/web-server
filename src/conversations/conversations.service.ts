import { Injectable } from '@nestjs/common';
import {
  ConversationsContext,
  CreateConversationInput,
  FinishConversationInput,
  GetConversationInput,
  GetNextMessageInput,
  HandleNextMessageInput,
  HandleSendMessageInput,
  SetupConversationInput,
  SpeechAndSaveMessageInput,
  UploadAndSaveMessageInput,
} from './dto/conversations.dtos';
import { AiService } from 'src/ai/ai.service';
import { ConversationsRepository } from './conversations.repository';
import {
  conversationMessagesSchema,
  generativeResponseFeedbackOverallSchemaValidator,
  generativeResponseFeedbackSchemaValidator,
} from './validator';
import { CONVERSATION_LEVEL } from './conversations.constants';
import { WsException } from '@nestjs/websockets';
import { TTSService } from 'src/tts/tts.service';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class ConversationsService {
  constructor(
    private conversationsRepository: ConversationsRepository,
    private readonly aiService: AiService,
    private ttsService: TTSService,
    private uploadService: UploadService,
  ) {}

  async createConversation(
    input: CreateConversationInput,
    context: ConversationsContext,
  ) {
    const level = CONVERSATION_LEVEL[input.level];
    const model = this.aiService.getConversationsGeneratorModel();

    const title = `Conversation about ${input.context} on level ${level}`;

    const messages = await this.aiService.generateContent(
      [`Level: ${level}; Context: ${input.context}.`],
      conversationMessagesSchema,
      model,
    );

    return this.conversationsRepository.createConversation(
      {
        ...input,
        messages,
        title,
        status: 'created',
      },
      context,
    );
  }

  async getConversation(
    input: GetConversationInput,
    context: ConversationsContext,
  ) {
    const conversation = await this.conversationsRepository.getConversation(
      input,
      context,
    );

    if (!conversation) {
      throw new WsException('Conversation not found');
    }

    return conversation;
  }

  async getFullConversation(
    input: GetConversationInput,
    context: ConversationsContext,
  ) {
    const conversation = await this.conversationsRepository.getFullConversation(
      {
        id: input.id,
      },
      context,
    );

    if (!conversation) {
      throw new WsException('Conversation not found');
    }

    return conversation;
  }

  private async getNextMessage(
    input: GetNextMessageInput,
    context: ConversationsContext,
  ) {
    const nextMessage = await this.conversationsRepository.getNextMessage(
      {
        id: input.conversationId,
      },
      context,
    );

    return nextMessage;
  }

  async handleSetupConversation(
    input: SetupConversationInput,
    context: ConversationsContext,
  ) {
    const conversation = await this.getConversation(input, context);

    if (conversation.status === 'finished') {
      context.socket?.emit('close');
      context.socket?.disconnect(true);
      return;
    }

    if (conversation.status === 'started') {
      const nextMessage = await this.getNextMessage(
        {
          conversationId: input.id,
        },
        context,
      );

      if (nextMessage?.isUser) {
        context.socket?.emit('request-message', nextMessage);
      }

      return;
    }

    await this.conversationsRepository.updateConversation(
      {
        id: input.id,
        status: 'started',
      },
      context,
    );

    await this.handleNextMessage(
      {
        conversationId: input.id,
      },
      context,
    );
  }

  async handleNextMessage(
    input: HandleNextMessageInput,
    context: ConversationsContext,
  ) {
    const nextMessage = await this.getNextMessage(
      {
        conversationId: input.conversationId,
      },
      context,
    );

    if (!nextMessage) {
      this.finishConversation(
        {
          conversationId: input.conversationId,
        },
        context,
      );
      return;
    }

    if (nextMessage.isUser) {
      context.socket?.emit('request-message', nextMessage);
      return;
    }

    const audioUrl = await this.speechAndSaveMessage(
      {
        conversationId: input.conversationId,
        message: nextMessage,
      },
      context,
    );

    context.socket?.emit('message', {
      ...nextMessage,
      audioUrl,
    });

    this.handleNextMessage(input, context);
  }

  async finishConversation(
    input: FinishConversationInput,
    context: ConversationsContext,
  ) {
    const feedbacksMessages =
      await this.conversationsRepository.getUserConversationMessages(
        {
          id: input.conversationId,
        },
        context,
      );

    const model = this.aiService.getConversationAnalyserModel();

    const data = await this.aiService.generateContent(
      [
        'Feedbacks:',
        ...feedbacksMessages.map(
          (lesson, index) => `${index}. "${lesson.feedback}""`,
        ),
      ],
      generativeResponseFeedbackOverallSchemaValidator,
      model,
    );

    const avgRating = +(
      feedbacksMessages.reduce((total, now) => now.rating + total, 0) /
      feedbacksMessages.length
    ).toFixed(2);

    await this.conversationsRepository.updateConversation(
      {
        id: input.conversationId,
        status: 'finished',
        feedback: data,
        rating: avgRating,
      },
      context,
    );

    context.socket?.emit('close', {
      feedback: data,
      rating: avgRating,
      status: 'finished',
    });

    context.socket?.disconnect();
  }

  async handleSendMessage(
    input: HandleSendMessageInput,
    context: ConversationsContext,
  ) {
    const conversation = await this.getConversation(
      {
        id: input.conversationId,
      },
      context,
    );

    if (conversation.status !== 'started') {
      context.socket?.emit('close');
      context.socket?.disconnect();
      return;
    }

    const nextMessage = await this.getNextMessage(
      {
        conversationId: input.conversationId,
      },
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

    this.handleNextMessage(
      {
        conversationId: input.conversationId,
      },
      context,
    );
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
