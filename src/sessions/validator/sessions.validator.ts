import { z } from 'zod';

export const createSessionSchemaInput = z.object({
  level: z.number().min(1).max(3),
  lessons: z.number().min(2).max(10),
  context: z.enum(['routine', 'cinema']),
});
