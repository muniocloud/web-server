import { z } from 'zod';
import { createSessionSchemaInput, getLessonSchemaInput } from './../validator';

export type CreateSessionInput = z.infer<typeof createSessionSchemaInput>;
export type GetLessonInput = z.infer<typeof getLessonSchemaInput>;
export type Lesson = {
  phrase: string;
  id: number;
};
