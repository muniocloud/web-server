import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DATA_SOURCE_PROVIDER } from 'src/database/database.constants';
import { Lesson } from './type/sessions.type';

type CreateSessionInput = {
  userId: number;
  context: string;
  lessons: number;
  level: number;
  lessonsItems: {
    phrase: string;
  }[];
};

type GetLessonInput = {
  lessonId: number;
  sessionId: number;
  userId: number;
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

  async getLesson(input: GetLessonInput): Promise<Lesson | null> {
    return this.dataSource('session_lesson as sl')
      .select(['sl.phrase as phrase', 'sl.id as id'])
      .leftJoin('session as s', function () {
        this.on('s.id', '=', 'sl.session_id')
          .andOnNull('s.deleted_at')
          .andOnVal('s.id', '=', input.sessionId)
          .andOnVal('s.user_id', '=', input.userId);
      })
      .where('sl.id', '=', input.lessonId)
      .whereNotNull('s.id')
      .whereNull('sl.deleted_at')
      .first();
  }
}
