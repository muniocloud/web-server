import { AuthUser } from 'src/auth/type/authuser.type';

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
