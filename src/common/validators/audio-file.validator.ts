import { calculateMbToBytes } from '../util/calculate-mb-to-bytes';
import { z } from 'zod';

const MAX_FILE_SIZE = calculateMbToBytes(5);

export const audioFileValidator = z
  .object({
    mimetype: z.string(),
    buffer: z.instanceof(Buffer),
  })
  .refine((file) => file.buffer.byteLength <= MAX_FILE_SIZE, {
    message: `Audio file is big, please compress first. Max size: 5mb`,
  })
  .refine((file) => file.mimetype.startsWith('audio/'), {
    message: 'Invalid file format. Allowed: audio/*',
  });
