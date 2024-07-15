import { z } from 'zod';

export const createSessionSchemaInput = z.object({
  level: z.number().min(1).max(3),
  lessons: z.number().min(2).max(10),
  context: z.enum([
    'routine',
    'cinema',
    'school',
    'hobbies',
    'travel',
    'work',
    'shopping',
    'social life',
    'health & wellness',
    'family life',
    'dinning out',
  ]),
});

export const idSchema = z.coerce.number().nonnegative().min(1);

export const getLessonSchemaInput = z.object({
  sessionId: idSchema,
  lessonId: idSchema,
});
