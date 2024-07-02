import { z } from 'zod';

export const signupInputSchemaValidator = z
  .object({
    name: z
      .string({
        message: 'name is required.',
      })
      .min(1)
      .max(100),
    password: z
      .string({
        message: 'password is required.',
      })
      .min(8)
      .max(48),
    email: z
      .string({
        message: 'email is required.',
      })
      .email(),
  })
  .required();
