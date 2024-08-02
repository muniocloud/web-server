import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard extends AuthGuard('ws-jwt') {
  getRequest(context: ExecutionContext) {
    const client = context.switchToWs().getClient() as Socket;
    return client.handshake;
  }
}
