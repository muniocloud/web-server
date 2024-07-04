import { z } from 'zod';
import { createSessionSchemaInput, getLessonSchemaInput } from './../validator';

export type CreateSessionInput = z.infer<typeof createSessionSchemaInput>;
export type GetLessonInput = z.infer<typeof getLessonSchemaInput>;
export type Lesson = {
  phrase: string;
  id: number;
};

export type Session = {
  userId: number;
  id: number;
  status: string;
  lessons: number;
  level: number;
  context: string;
  feedback: string;
  rating: number;
};

export type AwnseredLesson = {
  id: number;
  feedback: string;
  rating: number;
};
