import { z } from 'zod';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = 1024 * 1024 * MAX_FILE_SIZE_MB;

export const avatarSchemaValidator = z
  .object({
    mimetype: z.string(),
    buffer: z.instanceof(Buffer),
    fieldname: z.string(),
  })
  .refine((file) => file.buffer.byteLength <= MAX_FILE_SIZE, {
    message: `Avatar file is big, please compress first. Max size: ${MAX_FILE_SIZE_MB}mb`,
  })
  .refine((file) => file.mimetype.startsWith('image/'), {
    message: 'Invalid file format. Allowed: image/*',
  });
