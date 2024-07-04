import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DATA_SOURCE_PROVIDER } from 'src/database/database.constants';
import { AwnseredLesson, Lesson, Session } from './type/sessions.type';
import {
  GetSessionInput,
  GetNextLessonInput,
  GetAnsweredLessonsInput,
  CreateSessionInput,
  GetLessonInput,
  FinishSessionInput,
  AnswerLessonInput,
} from './dto/sessions.repository.dto';
import { GetUserSessionInput, GetUserSessionsInput } from './dto/sessions.dto';

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

  async getUserSessions(
    input: GetUserSessionsInput,
  ): Promise<Session[] | null> {
    return this.dataSource('session')
      .select([
        'user_id as userId',
        'id',
        'status',
        'feedback',
        'rating',
        'lessons',
        'level',
        'context',
      ])
      .where('user_id', '=', input.userId)
      .whereNull('deleted_at');
  }

  async getUserSession(input: GetUserSessionInput): Promise<Session | null> {
    return this.dataSource('session')
      .select([
        'user_id as userId',
        'id',
        'status',
        'feedback',
        'rating',
        'lessons',
        'level',
        'context',
      ])
      .where('id', '=', input.sessionId)
      .where('user_id', '=', input.userId)
      .whereNull('deleted_at')
      .first();
  }

  async getSession(input: GetSessionInput): Promise<Session | null> {
    return this.dataSource('session')
      .select([
        'user_id as userId',
        'id',
        'status',
        'lessons',
        'level',
        'context',
        'feedback',
        'rating',
      ])
      .where('id', '=', input.sessionId)
      .where('user_id', '=', input.userId)
      .whereNull('deleted_at')
      .first();
  }

  async createLessonAnswer(input: AnswerLessonInput) {
    return this.dataSource.transaction(async function (transaction) {
      await transaction('session_lesson_response')
        .update('deleted_at', transaction.fn.now())
        .where('lesson_id', '=', input.lessonId)
        .whereNull('deleted_at');
      await transaction('session_lesson_response').insert({
        lesson_id: input.lessonId,
        response_url: input.audioUrl,
        feedback: input.feedback,
        rating: input.rating,
      });
    });
  }

  async getNextLesson(
    input: GetNextLessonInput,
  ): Promise<Pick<Lesson, 'id'> | null> {
    return this.dataSource('session_lesson as sl')
      .select(['sl.id as id'])
      .leftJoin('session as s', function () {
        this.on('s.id', '=', 'sl.session_id')
          .andOnNull('s.deleted_at')
          .andOnVal('s.id', '=', input.sessionId)
          .andOnVal('s.user_id', '=', input.userId);
      })
      .leftJoin('session_lesson_response as slr', function () {
        this.on('slr.lesson_id', '=', 'sl.id');
      })
      .whereNull('slr.id')
      .whereNotNull('s.id')
      .whereNull('sl.deleted_at')
      .first();
  }

  async getAnsweredLessons(
    input: GetAnsweredLessonsInput,
  ): Promise<AwnseredLesson[] | null> {
    return this.dataSource('session_lesson_response as slr')
      .select('slr.lesson_id', 'slr.feedback', 'slr.rating')
      .leftJoin('session_lesson as sl', function () {
        this.on('slr.lesson_id', '=', 'sl.id')
          .andOnNull('sl.deleted_at')
          .andOnVal('sl.session_id', input.sessionId);
      })
      .leftJoin('session as s', function () {
        this.on('sl.session_id', '=', 's.id').andOnVal(
          's.user_id',
          input.userId,
        );
      })
      .whereNull('slr.deleted_at')
      .whereNotNull('sl.id')
      .whereNotNull('sl.id');
  }

  async finishSession(input: FinishSessionInput) {
    return this.dataSource('session')
      .update({
        feedback: input.feedback,
        rating: input.rating,
        status: 'finished',
        updated_at: this.dataSource.fn.now(),
      })
      .where('id', '=', input.sessionId)
      .andWhere('user_id', '=', input.userId);
  }
}
