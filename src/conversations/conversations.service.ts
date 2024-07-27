import { Injectable } from '@nestjs/common';
import {
  ConversationsContext,
  CreateConversationInput,
} from './dto/conversations.dtos';
import { AiService } from 'src/ai/ai.service';
import { ConversationsRepository } from './conversations.repository';
import { conversationMessagesSchema } from './validator';
import { CONVERSATION_LEVEL } from './conversations.constants';

@Injectable()
export class ConversationsService {
  constructor(
    private conversationsRepository: ConversationsRepository,
    private readonly aiService: AiService,
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
}
