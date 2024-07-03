import { z } from 'zod';

export const phrasesShema = z.array(
  z.object({
    phrase: z.string(),
  }),
);
