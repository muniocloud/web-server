import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JWTUser as JWTUserType } from '../type';

export const JWTUser = createParamDecorator(
  (_data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{
      user: JWTUserType;
    }>();
    return request.user;
  },
);
