import { z } from 'zod';
import { createSessionSchemaInput } from './../validator';

export type CreateSessionInput = z.infer<typeof createSessionSchemaInput>;
