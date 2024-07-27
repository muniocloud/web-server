import { createSessionSchemaInput, getLessonSchemaInput } from '../validator';
import { z } from 'zod';
import { User } from 'src/auth/type';

export type SessionsContext = {
  user: User;
};

export type AnswerLessonInput = {
  audio: Express.Multer.File;
  lessonId: number;
  sessionId: number;
};

export type CreateSessionResultInput = {
  sessionId: number;
};

export type CreateSessionInput = z.infer<typeof createSessionSchemaInput>;

export type GetLessonInput = z.infer<typeof getLessonSchemaInput>;

export type GetUserSessionsInput = {
  userId: number;
};
