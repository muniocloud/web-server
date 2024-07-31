import { PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { zodValidate } from '../util/zod-validate';

export class ZodValidatorPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    return zodValidate(value, this.schema);
  }
}
