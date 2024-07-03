import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DATA_SOURCE_PROVIDER } from 'src/database/database.constants';

type CreateSessionInput = {
  userId: number;
  context: string;
  lessons: number;
  level: number;
  lessonsItems: {
    phrase: string;
  }[];
};

@Injectable()
export class SessionsRepository {
  constructor(@Inject(DATA_SOURCE_PROVIDER) private dataSource: Knex) {}

  async createSession(input: CreateSessionInput) {
    return this.dataSource.transaction(async function (transaction) {
      const [sessionId] = await transaction('session').insert(
        {
          user_id: input.userId,
          status: 'started',
          context: input.context,
          lessons: input.lessons,
          level: input.level,
        },
        ['id'],
      );

      await transaction('session_lesson').insert(
        input.lessonsItems.map((input) => ({
          session_id: sessionId,
          phrase: input.phrase,
        })),
        ['id'],
      );

      const lessons = await transaction('session_lesson')
        .select('id')
        .where('session_id', '=', sessionId);

      return {
        sessionId,
        lessonsIds: lessons.map((lesson) => lesson.id),
      };
    });
  }
}
