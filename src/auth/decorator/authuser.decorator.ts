import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthUser } from '../type/authuser.type';

export const User = createParamDecorator((_data, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<{
    user: AuthUser;
  }>();
  const user = request.user;
  return {
    id: user.userId,
    email: user.email,
  };
});
