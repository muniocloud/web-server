import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DATA_SOURCE_PROVIDER } from 'src/database/database.constants';
import {
  AnswerLessonInput,
  CreateSessionFeedbackInput,
  CreateSessionInput,
  GetLessonInput,
  UpdateSessionInput,
} from './dtos/sessions.repository.dtos';
import { STATUS } from 'src/common/enums';
import {
  AwnseredLesson,
  Lesson,
  Session,
  SessionFeedback,
} from './types/sessions.types';
import { SessionsContext } from './dtos/sessions.dtos';

@Injectable()
export class SessionsRepository {
  constructor(@Inject(DATA_SOURCE_PROVIDER) private dataSource: Knex) {}

  async createSession(input: CreateSessionInput, context: SessionsContext) {
    return this.dataSource.transaction(async function (transaction) {
      const [sessionId] = await transaction('session').insert(
        {
          user_id: context.user.id,
          status: STATUS.STARTED,
          context: input.context,
          lessons: input.lessons,
          level: input.level,
          title: input.title,
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

  async createSessionFeedback(
    input: CreateSessionFeedbackInput,
    _context: SessionsContext,
  ) {
    return this.dataSource.transaction(async function (transaction) {
      await transaction('session_feedback')
        .update({
          deleted_at: transaction.fn.now(),
        })
        .where('session_id', '=', input.sessionId);

      const [feedbackId] = await transaction('session_feedback').insert(
        {
          feedback: input.feedback,
          rating: input.rating,
          session_id: input.sessionId,
        },
        ['id'],
      );

      return feedbackId;
    });
  }

  getSessionFeedback(sessionId: number, _context: SessionsContext) {
    return this.dataSource('session_feedback')
      .select<SessionFeedback>(['id', 'feedback', 'rating'])
      .where('session_id', '=', sessionId)
      .whereNull('deleted_at')
      .first();
  }

  async getLesson(
    input: GetLessonInput,
    context: SessionsContext,
  ): Promise<Lesson | null> {
    return this.dataSource('session_lesson as sl')
      .select(['sl.phrase as phrase', 'sl.id as id'])
      .leftJoin('session as s', function () {
        this.on('s.id', '=', 'sl.session_id')
          .andOnNull('s.deleted_at')
          .andOnVal('s.id', '=', input.sessionId)
          .andOnVal('s.user_id', '=', context.user.id);
      })
      .where('sl.id', '=', input.lessonId)
      .whereNotNull('s.id')
      .whereNull('sl.deleted_at')
      .first();
  }

  async getUserSessions(context: SessionsContext): Promise<Session[]> {
    return this.dataSource('session')
      .select([
        'user_id as userId',
        'id',
        'status',
        'lessons',
        'level',
        'context',
      ])
      .where('user_id', '=', context.user.id)
      .whereNull('deleted_at');
  }

  async getSession(
    sessionId: number,
    context: SessionsContext,
  ): Promise<Session | null> {
    return this.dataSource('session')
      .select([
        'user_id as userId',
        'id',
        'status',
        'lessons',
        'level',
        'context',
      ])
      .where('id', '=', sessionId)
      .where('user_id', '=', context.user.id)
      .whereNull('deleted_at')
      .first();
  }

  async getFullSession(
    sessionId: number,
    context: SessionsContext,
  ): Promise<Session | null> {
    return this.dataSource('session AS s')
      .select([
        's.id',
        's.user_id AS userId',
        's.title',
        's.status',
        's.context',
        's.lessons',
        's.level',
        'sf.feedback',
        'sf.rating',
        this.dataSource.raw(`JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', sl.id,
            'phrase', sl.phrase,
          	'answered', slr.id IS NOT NULL
        )
    ) AS lessonsItens`),
      ])
      .leftJoin('session_feedback AS sf', function () {
        this.on('sf.session_id', '=', 's.id').andOnNull('sf.deleted_at');
      })
      .leftJoin('session_lesson AS sl', function () {
        this.on('sl.session_id', '=', 's.id').andOnNull('sl.deleted_at');
      })
      .leftJoin('session_lesson_response AS slr', function () {
        this.on('slr.lesson_id', '=', 'sl.id').andOnNull('slr.deleted_at');
      })
      .where('s.id', '=', sessionId)
      .where('s.user_id', '=', context.user.id)
      .whereNull('s.deleted_at')
      .groupBy([
        's.id',
        's.title',
        's.status',
        's.context',
        's.lessons',
        's.level',
        'sf.feedback',
        'sf.rating',
      ])
      .first();
  }

  async createLessonAnswer(
    input: AnswerLessonInput,
    _context: SessionsContext,
  ) {
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
    sessionId: number,
    context: SessionsContext,
  ): Promise<Pick<Lesson, 'id'> | null> {
    return this.dataSource('session_lesson as sl')
      .select(['sl.id as id'])
      .leftJoin('session as s', function () {
        this.on('s.id', '=', 'sl.session_id')
          .andOnNull('s.deleted_at')
          .andOnVal('s.id', '=', sessionId)
          .andOnVal('s.user_id', '=', context.user.id);
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
    sessionId: number,
    context: SessionsContext,
  ): Promise<AwnseredLesson[] | null> {
    return this.dataSource('session_lesson_response as slr')
      .select('slr.lesson_id', 'slr.feedback', 'slr.rating')
      .leftJoin('session_lesson as sl', function () {
        this.on('slr.lesson_id', '=', 'sl.id')
          .andOnNull('sl.deleted_at')
          .andOnVal('sl.session_id', sessionId);
      })
      .leftJoin('session as s', function () {
        this.on('sl.session_id', '=', 's.id').andOnVal(
          's.user_id',
          context.user.id,
        );
      })
      .whereNull('slr.deleted_at')
      .whereNotNull('sl.id')
      .whereNotNull('sl.id');
  }

  async updateSession(input: UpdateSessionInput, context: SessionsContext) {
    const { sessionId, ...inputData } = input;
    return this.dataSource('session')
      .update({
        ...inputData,
        updated_at: this.dataSource.fn.now(),
      })
      .where('id', '=', sessionId)
      .andWhere('user_id', '=', context.user.id);
  }
}
