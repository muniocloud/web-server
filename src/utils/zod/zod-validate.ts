import { BadRequestException } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

export const zodValidate = (value: unknown, schema: ZodSchema) => {
  try {
    const parsedValue = schema.parse(value);
    return parsedValue;
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError && error.issues.length) {
      throw new BadRequestException(error.issues[0].message);
    }
    console.error('Unhandled error', error);
    throw new BadRequestException('Validation error.');
  }
};
