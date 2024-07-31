import { STATUS } from 'src/common/enums';

export type Lesson = {
  phrase: string;
  id: number;
};

export type LessonStatus = {
  id: number;
  answered: boolean;
};

export type Session = {
  userId: number;
  id: number;
  status: STATUS;
  lessons: number;
  level: number;
  context: string;
};

export type SessionFeedback = {
  id: number;
  feedback: string;
  rating: number;
};

export type AwnseredLesson = {
  id: number;
  feedback: string;
  rating: number;
};
