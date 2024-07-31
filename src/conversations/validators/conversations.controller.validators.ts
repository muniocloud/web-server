import { z } from 'zod';
import { DURATION, CONTEXT, LEVEL } from 'src/common/enums';

export const createConversationSchemaValidator = z.object({
  level: z.nativeEnum(LEVEL),
  duration: z.nativeEnum(DURATION),
  context: z.nativeEnum(CONTEXT),
});
