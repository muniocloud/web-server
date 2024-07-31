import {
  createSessionSchemaInput,
  getLessonSchemaInput,
} from '../validators/sessions.validators';
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

export type CreateSessionInput = z.infer<typeof createSessionSchemaInput>;

export type GetLessonInput = z.infer<typeof getLessonSchemaInput>;
