import {
  BadRequestException,
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
import { Lesson, Session } from './types/sessions.types';
import { avgRatingCalculator } from 'src/common/util/avg-rating-calculator';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly uploadService: UploadService,
    private readonly aiService: AiService,
    private readonly userService: UserService,
  ) {}

  async createSession(input: CreateSessionInput, context: SessionsContext) {
    const level = LEVEL_LABEL[input.level];

    const model = this.aiService.getLessonsGeneratorModel();

    const title = `Session about ${input.context} on level ${level}`;

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

    const model = this.aiService.getAnswerAnalyserModel(lesson.phrase);

    const data = await this.aiService.generateContent(
      [this.aiService.createFilePart(audio)],
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
        'Session not finished yet.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userName = await this.userService.getUserFirstName(context.user);

    const model = this.aiService.getSessionAnalyserModel(userName);

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

    const rating = +avgRatingCalculator(awnseredLessons).toFixed(2);

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

    return {
      feedback,
      rating,
    };
  }

  async getSessionFeedback(session: Session, context: SessionsContext) {
    if (session.status === STATUS.FINISHED) {
      const sessionFeedback = await this.sessionsRepository.getSessionFeedback(
        session.id,
        context,
      );

      if (!sessionFeedback) {
        return null;
      }

      return {
        feedback: sessionFeedback.feedback,
        rating: sessionFeedback.rating,
      };
    }

    return null;
  }

  async finishSession(sessionId: number, context: SessionsContext) {
    const session = await this.getSession(sessionId, context);

    if (session.status !== STATUS.STARTED) {
      throw new BadRequestException('Session not started yet.');
    }

    const sessionFeedback = await this.getSessionFeedback(session, context);

    if (sessionFeedback) {
      return sessionFeedback;
    }

    return this.createSessionFeedback(session, context);
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
    const result = await this.sessionsRepository.getFullSession(
      sessionId,
      context,
    );

    if (result) {
      const { userId: _, ...rest } = result;

      return {
        ...rest,
        level: LEVEL_LABEL[result.level],
      };
    }

    throw new NotFoundException();
  }
}
