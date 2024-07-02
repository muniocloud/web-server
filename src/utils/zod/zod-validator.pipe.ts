import { PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { zodValidate } from './zod-validate';

export class ZodValidatorPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    return zodValidate(value, this.schema);
  }
}
