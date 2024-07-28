import { Inject, Injectable } from '@nestjs/common';
import {
  AddConversationMessageResponseRepositoryInput,
  ConversationsContext,
  CreateConversationRepositoryInput,
  GetConversationRepositoryInput,
  UpdateConversationRepositoryInput,
} from './dto/conversations.dtos';
import { DATA_SOURCE_PROVIDER } from 'src/database/database.constants';
import { Knex } from 'knex';
import {
  Conversation,
  ConversationMessage,
  ConversationMessageResponse,
} from './type';

@Injectable()
export class ConversationsRepository {
  constructor(@Inject(DATA_SOURCE_PROVIDER) private dataSource: Knex) {}

  createConversation(
    input: CreateConversationRepositoryInput,
    context: ConversationsContext,
  ) {
    return this.dataSource.transaction(async (trx) => {
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
  }

  updateConversation(
    input: UpdateConversationRepositoryInput,
    context: ConversationsContext,
  ) {
    const { id, ...inputData } = input;
    return this.dataSource('conversation')
      .update(inputData)
      .where('id', '=', id)
      .where('user_id', '=', context.user.id);
  }

  addConversationMessageResponse(
    input: AddConversationMessageResponseRepositoryInput,
    _context: ConversationsContext,
  ) {
    return this.dataSource.transaction(async function (transaction) {
      await transaction('conversation_message_response')
        .update('deleted_at', transaction.fn.now())
        .where('conversation_message_id', '=', input.conversationMessageId);

      await transaction('conversation_message_response').insert({
        conversation_message_id: input.conversationMessageId,
        audio_response_url: input.audioUrl,
        feedback: input.feedback,
        rating: input.rating,
      });
    });
  }

  getConversation(
    input: GetConversationRepositoryInput,
    context: ConversationsContext,
  ): Promise<Conversation | null> {
    return this.dataSource('conversation')
      .select(['id', 'status', 'title'])
      .where('user_id', '=', context.user.id)
      .andWhere('id', '=', input.id)
      .whereNull('deleted_at')
      .first();
  }

  getConversations(context: ConversationsContext) {
    return this.dataSource('conversation')
      .select(['id', 'status', 'title'])
      .where('user_id', '=', context.user.id)
      .whereNull('deleted_at');
  }

  getFullConversation(
    input: GetConversationRepositoryInput,
    context: ConversationsContext,
  ) {
    return this.dataSource('conversation AS c')
      .select([
        'c.id',
        'c.title',
        'c.status',
        'c.rating',
        'c.feedback',
        this.dataSource.raw(`JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', cm.id,
            'messsage', cm.message,
          	'isUser', cm.is_user,
          	'audioUrl', cmr.audio_response_url
        ) 
    ) AS messages`),
      ])
      .join('conversation_message AS cm', function () {
        this.on('c.id', '=', 'cm.conversation_id')
          .andOnVal('c.user_id', '=', context.user.id)
          .andOnNull('deleted_at');
      })
      .leftJoin('conversation_message_response AS cmr', function () {
        this.on('cm.id', '=', 'cmr.conversation_message_id').andOnNull(
          'cmr.deleted_at',
        );
      })
      .where('c.id', '=', input.id)
      .whereNull('c.deleted_at');
  }

  getUserConversationMessages(
    input: GetConversationRepositoryInput,
    context: ConversationsContext,
  ): Promise<ConversationMessageResponse[]> {
    return this.dataSource('conversation AS c')
      .select([
        'cmr.id',
        'cmr.feedback',
        'cmr.rating',
        'cmr.audio_response_url as audioUrl',
      ])
      .join('conversation_message AS cm', function () {
        this.on('cm.conversation_id', '=', 'c.id')
          .andOnNull('cm.deleted_at')
          .andOnVal('cm.is_user', '=', 1);
      })
      .join('conversation_message_response AS cmr', function () {
        this.on('cmr.conversation_message_id', '=', 'cm.id').andOnNull(
          'cmr.deleted_at',
        );
      })
      .where('c.id', '=', input.id)
      .where('c.user_id', '=', context.user.id)
      .whereNull('cmr.deleted_at');
  }

  async getNextMessage(
    input: GetConversationRepositoryInput,
    context: ConversationsContext,
  ): Promise<ConversationMessage | undefined> {
    const message = await this.dataSource('conversation AS c')
      .select<ConversationMessage>([
        'cm.id',
        'cm.message',
        'cm.is_user as isUser',
      ])
      .join('conversation_message AS cm', function () {
        this.on('cm.conversation_id', '=', 'c.id').andOnNull('cm.deleted_at');
      })
      .leftJoin('conversation_message_response AS cmr', function () {
        this.on('cmr.conversation_message_id', '=', 'cm.id').andOnNull(
          'cmr.deleted_at',
        );
      })
      .whereNull('cmr.id')
      .andWhere('c.id', '=', input.id)
      .andWhere('c.user_id', '=', context.user.id)
      .whereNull('c.deleted_at')
      .first();

    if (message) {
      message.isUser = !!message.isUser;
    }

    return message;
  }
}
