import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JWTPayload } from '../type';

export const JWTUser = createParamDecorator(
  (_data, context: ExecutionContext) => {
    const client = context.switchToWs().getClient();
    const user = client.handshake.user as JWTPayload;
    return user;
  },
);
