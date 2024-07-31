import { CONTEXT, LEVEL } from 'src/common/enums';
import { z } from 'zod';

export const phrasesShema = z.array(
  z.object({
    phrase: z.string(),
  }),
);

export const createSessionSchemaInput = z.object({
  level: z.nativeEnum(LEVEL),
  lessons: z.number().min(2).max(10),
  context: z.nativeEnum(CONTEXT),
});

export const idSchema = z.coerce.number().positive();

export const getLessonSchemaInput = z.object({
  sessionId: idSchema,
  lessonId: idSchema,
});

export const generativeResponseFeedbackSchemaValidator = z.object({
  feedback: z.string(),
  rating: z.number().min(0).max(10),
});

export const generativeResponseFeedbackOverallSchemaValidator = z.string();
