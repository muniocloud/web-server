import { Inject, Injectable } from '@nestjs/common';
import {
  ConversationsContext,
  CreateConversationRepositoryInput,
} from './dto/conversations.dtos';
import { DATA_SOURCE_PROVIDER } from 'src/database/database.constants';
import { Knex } from 'knex';

@Injectable()
export class ConversationsRepository {
  constructor(@Inject(DATA_SOURCE_PROVIDER) private dataSource: Knex) {}

  createConversation(
    input: CreateConversationRepositoryInput,
    context: ConversationsContext,
  ) {
    this.dataSource.transaction(async (trx) => {
      const [conversationId] = await trx('conversation').insert(
        {
          title: input.title,
          level: input.level,
          context: input.context,
          status: input.status,
          user_id: context.user.id,
        },
        ['id'],
      );

      const messages = input.messages.map((message) => ({
        conversation_id: conversationId,
        message: message.message,
        is_user: message.isUser,
      }));

      const datas = await trx('conversation_message').insert(messages, ['id']);

      return {
        conversationId,
        datas,
      };
    });
    return true;
  }
}
