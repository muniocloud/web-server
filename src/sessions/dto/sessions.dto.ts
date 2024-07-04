import { AuthUser } from 'src/auth/type/authuser.type';
import { createSessionSchemaInput, getLessonSchemaInput } from '../validator';
import { z } from 'zod';

export type AnswerLessonInput = {
  audio: Express.Multer.File;
  lessonId: number;
  sessionId: number;
  user: AuthUser;
};

export type CreateSessionResultInput = {
  sessionId: number;
  user: AuthUser;
};

export type CreateSessionInput = z.infer<typeof createSessionSchemaInput>;
export type GetLessonInput = z.infer<typeof getLessonSchemaInput>;

export type GetUserSessionsInput = {
  userId: number;
};

export type GetUserSessionInput = {
  userId: number;
  sessionId: number;
};
