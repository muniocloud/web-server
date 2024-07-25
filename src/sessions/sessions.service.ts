import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Lesson, LessonStatus, Session } from './type/sessions.type';
import { SessionsRepository } from './sessions.repository';
import { phrasesShema } from './validator/generative.validator';
import { SESSION_LEVEL } from './sessions.constants';
import { UploadService } from 'src/upload/upload.service';
import {
  generativeResponseFeedbackOverallSchemaValidator,
  generativeResponseFeedbackSchemaValidator,
} from './validator';
import {
  AnswerLessonInput,
  CreateSessionResultInput,
  CreateSessionInput,
  GetLessonInput,
  GetUserSessionsInput,
  SessionsContext,
} from './dto/sessions.service.dto';
import { AiService } from 'src/ai/ai.service';
import {
  GetLessonsStatusInput,
  GetSessionInput,
} from './dto/sessions.repository.dto';

@Injectable()
export class SessionsService {
  constructor(
    private sessionsRepository: SessionsRepository,
    private readonly uploadService: UploadService,
    private readonly aiService: AiService,
  ) {}

  async createSession(input: CreateSessionInput, { user }: SessionsContext) {
    const level = SESSION_LEVEL[input.level];

    const model = this.aiService.getLessonsGeneratorModel();

    const title = `Session about ${input.context} on level ${input.level}`;

    const phrases = await this.aiService.generateContent(
      [
        `Lessons: ${input.lessons}; Level: ${level}; Context: ${input.context}.`,
      ],
      phrasesShema,
      model,
    );

    return this.sessionsRepository.createSession({
      ...input,
      userId: +user.id,
      lessonsItems: phrases,
      title,
    });
  }

  async getLesson(
    input: GetLessonInput,
    { user }: SessionsContext,
  ): Promise<Lesson> {
    const result = await this.sessionsRepository.getLesson({
      ...input,
      userId: user.id,
    });

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

    const model = this.aiService.getAnswerAnalyserModel();

    const data = await this.aiService.generateContent(
      [lesson.phrase, this.aiService.createFilePart(audio)],
      generativeResponseFeedbackSchemaValidator,
      model,
    );

    await this.sessionsRepository.createLessonAnswer({
      audioUrl: url,
      lessonId,
      rating: data.rating,
      feedback: data.feedback,
    });

    const nextLesson = await this.sessionsRepository.getNextLesson({
      sessionId,
      userId: context.user.id,
    });

    return {
      rating: data.rating,
      feedback: data.feedback,
      nextLessonId: nextLesson?.id ?? null,
    };
  }

  async createOrGetSessionResult(
    { sessionId }: CreateSessionResultInput,
    { user }: SessionsContext,
  ) {
    const session = await this.sessionsRepository.getSession({
      sessionId,
      userId: user.id,
    });

    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    if (session.status === 'finished') {
      return {
        feedback: session.feedback,
        rating: session.rating,
      };
    }

    const awnseredLessons = await this.sessionsRepository.getAnsweredLessons({
      sessionId,
      userId: user.id,
    });

    if (session.lessons !== awnseredLessons?.length) {
      throw new HttpException(
        'There are some lessons to complete before get results.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const model = this.aiService.getSessionAnalyserModel();

    const data = await this.aiService.generateContent(
      [
        'Feedbacks:',
        ...awnseredLessons.map(
          (lesson, index) => `${index}. "${lesson.feedback}""`,
        ),
      ],
      generativeResponseFeedbackOverallSchemaValidator,
      model,
    );

    const avgRating = +(
      awnseredLessons.reduce((total, now) => now.rating + total, 0) /
      awnseredLessons.length
    ).toFixed(2);

    await this.sessionsRepository.finishSession({
      feedback: data,
      rating: avgRating,
      sessionId,
      userId: user.id,
    });

    return {
      feedback: data,
      rating: avgRating,
    };
  }

  async getUserSessions(
    input: GetUserSessionsInput,
  ): Promise<Omit<Session, 'userId'>[]> {
    const result = (await this.sessionsRepository.getUserSessions(input)) ?? [];

    return result.map((session) => ({
      ...session,
      userId: undefined,
      level: SESSION_LEVEL[session.level],
    }));
  }

  async getUserSession(
    input: GetSessionInput,
  ): Promise<Omit<Session, 'userId'>> {
    const result = await this.sessionsRepository.getSession(input);

    if (result) {
      const { userId: _, ...rest } = result;

      return {
        ...rest,
        level: SESSION_LEVEL[result.level],
      };
    }

    throw new NotFoundException();
  }

  async getLessonsStatus(
    input: GetLessonsStatusInput,
  ): Promise<LessonStatus[]> {
    const result = await this.sessionsRepository.getLessonsStatus(input);

    if (result?.length) {
      return result.map(({ id, answered }) => ({
        id,
        answered: !!answered,
      }));
    }

    throw new NotFoundException();
  }
}
