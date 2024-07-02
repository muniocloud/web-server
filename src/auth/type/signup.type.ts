import { z } from 'zod';
import { signupInputSchemaValidator } from '../validator';

export type SignUpInput = z.infer<typeof signupInputSchemaValidator>;
