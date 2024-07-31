import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionsRepository } from './sessions.repository';
import { UploadService } from 'src/upload/upload.service';
import { AiService } from 'src/ai/ai.service';
import {
  AnswerLessonInput,
  CreateSessionInput,
  GetLessonInput,
  SessionsContext,
} from './dtos/sessions.dtos';
import { LEVEL_LABEL, STATUS } from 'src/common/enums';
import {
  generativeResponseFeedbackOverallSchemaValidator,
  generativeResponseFeedbackSchemaValidator,
  phrasesShema,
} from './validators/sessions.validators';
import { Lesson, LessonStatus, Session } from './types/sessions.types';
import { avgCalculator } from 'src/common/util/avg-calculator';

@Injectable()
export class SessionsService {
  constructor(
    private sessionsRepository: SessionsRepository,
    private readonly uploadService: UploadService,
    private readonly aiService: AiService,
  ) {}

  async createSession(input: CreateSessionInput, context: SessionsContext) {
    const level = LEVEL_LABEL[input.level];

    const model = this.aiService.getLessonsGeneratorModel();

    const title = `Session about ${input.context} on level ${input.level}`;

    const phrases = await this.aiService.generateContent(
      [
        `Lessons: ${input.lessons}; Level: ${level}; Context: ${input.context}.`,
      ],
      phrasesShema,
      model,
    );

    return this.sessionsRepository.createSession(
      {
        ...input,
        lessonsItems: phrases,
        title,
      },
      context,
    );
  }

  async getLesson(
    input: GetLessonInput,
    context: SessionsContext,
  ): Promise<Lesson> {
    const result = await this.sessionsRepository.getLesson(input, context);

    if (result) {
      return result;
    }

    throw new NotFoundException();
  }

  async answerLesson(
    { sessionId, lessonId, audio }: AnswerLessonInput,
    context: SessionsContext,
  ) {
    const session = await this.getSession(sessionId, context);

    const lesson = await this.getLesson(
      {
        lessonId,
        sessionId,
      },
      context,
    );

    const url = await this.uploadService.upload(
      audio,
      `answer-lesson-${lesson.id}`,
    );

    const model = this.aiService.getAnswerAnalyserModel();

    const data = await this.aiService.generateContent(
      [lesson.phrase, this.aiService.createFilePart(audio)],
      generativeResponseFeedbackSchemaValidator,
      model,
    );

    await this.sessionsRepository.createLessonAnswer(
      {
        audioUrl: url,
        lessonId,
        rating: data.rating,
        feedback: data.feedback,
      },
      context,
    );

    const nextLesson = await this.sessionsRepository.getNextLesson(
      sessionId,
      context,
    );

    if (!nextLesson) {
      await this.createSessionFeedback(session, context);
    }

    return {
      rating: data.rating,
      feedback: data.feedback,
      nextLessonId: nextLesson?.id ?? null,
    };
  }

  async getSession(sessionId: number, context: SessionsContext) {
    const session = await this.sessionsRepository.getSession(
      sessionId,
      context,
    );

    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    return session;
  }

  private async createSessionFeedback(
    session: Session,
    context: SessionsContext,
  ) {
    const { id: sessionId } = session;

    const awnseredLessons = await this.sessionsRepository.getAnsweredLessons(
      sessionId,
      context,
    );

    if (session.lessons !== awnseredLessons?.length) {
      throw new HttpException(
        'There are some lessons to complete before get results.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const model = this.aiService.getSessionAnalyserModel();

    const feedback = await this.aiService.generateContent(
      [
        'Feedbacks:',
        ...awnseredLessons.map(
          (lesson, index) => `${index}. "${lesson.feedback}""`,
        ),
      ],
      generativeResponseFeedbackOverallSchemaValidator,
      model,
    );

    const rating = +avgCalculator(awnseredLessons).toFixed(2);

    await this.sessionsRepository.updateSession(
      {
        sessionId: sessionId,
        status: STATUS.FINISHED,
      },
      context,
    );

    await this.sessionsRepository.createSessionFeedback(
      {
        feedback,
        rating,
        sessionId,
      },
      context,
    );
  }

  async getSessionFeedback(sessionId: number, context: SessionsContext) {
    const session = await this.getSession(sessionId, context);

    if (session.status === STATUS.FINISHED) {
      const sessionFeedback = await this.sessionsRepository.getSessionFeedback(
        sessionId,
        context,
      );

      if (!sessionFeedback) {
        throw new HttpException(
          'Something is wrong with this session. Sorry.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        feedback: sessionFeedback.feedback,
        rating: sessionFeedback.rating,
      };
    }

    throw new NotFoundException();
  }

  async getUserSessions(
    context: SessionsContext,
  ): Promise<Omit<Session, 'userId'>[]> {
    const result = await this.sessionsRepository.getUserSessions(context);

    return result.map((session) => ({
      ...session,
      userId: undefined,
      level: LEVEL_LABEL[session.level],
    }));
  }

  async getUserSession(
    sessionId: number,
    context: SessionsContext,
  ): Promise<Omit<Session, 'userId'>> {
    const result = await this.sessionsRepository.getSession(sessionId, context);

    if (result) {
      const { userId: _, ...rest } = result;

      return {
        ...rest,
        level: LEVEL_LABEL[result.level],
      };
    }

    throw new NotFoundException();
  }

  async getLessonsStatus(
    sessionId: number,
    context: SessionsContext,
  ): Promise<LessonStatus[]> {
    const result = await this.sessionsRepository.getLessonsStatus(
      sessionId,
      context,
    );

    if (result?.length) {
      return result.map(({ id, answered }) => ({
        id,
        answered: !!answered,
      }));
    }

    throw new NotFoundException();
  }
}
