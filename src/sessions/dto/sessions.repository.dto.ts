export type CreateSessionInput = {
  userId: number;
  context: string;
  lessons: number;
  level: number;
  lessonsItems: {
    phrase: string;
  }[];
};

export type GetLessonInput = {
  lessonId: number;
  sessionId: number;
  userId: number;
};

export type GetSessionInput = {
  sessionId: number;
  userId: number;
};

export type AnswerLessonInput = {
  audioUrl: string;
  feedback: string;
  rating: number;
  lessonId: number;
};

export type GetNextLessonInput = {
  sessionId: number;
  userId: number;
};

export type GetAnsweredLessonsInput = {
  sessionId: number;
  userId: number;
};

export type FinishSessionInput = {
  sessionId: number;
  userId: number;
  rating: number;
  feedback: string;
};
