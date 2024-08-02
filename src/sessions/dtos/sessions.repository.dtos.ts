import { STATUS } from 'src/common/enums';

export type CreateSessionInput = {
  context: string;
  lessons: number;
  level: number;
  title: string;
  lessonsItems: {
    phrase: string;
  }[];
};

export type CreateSessionFeedbackInput = {
  sessionId: number;
  feedback: string;
  rating: number;
};

export type GetLessonInput = {
  lessonId: number;
  sessionId: number;
};

export type AnswerLessonInput = {
  audioUrl: string;
  feedback: string;
  rating: number;
  lessonId: number;
};

export type UpdateSessionInput = {
  sessionId: number;
  title?: string;
  status?: STATUS;
};
