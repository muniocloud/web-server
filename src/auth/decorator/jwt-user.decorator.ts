import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JWTPayload } from '../type';

export const JWTUser = createParamDecorator(
  (_data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{
      user: JWTPayload;
    }>();
    return request.user;
  },
);
