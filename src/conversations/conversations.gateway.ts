import { UseFilters, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { WsJwtAuthGuard } from 'src/auth/guard/ws-jwt.guard';
import { HttpExceptionFilter } from './filter/http.filter';
import { JWTUser } from 'src/auth/decorator/ws-jwt-user.decorator';
import { User } from 'src/auth/type';

@WebSocketGateway({ namespace: 'conversations' })
@UseGuards(WsJwtAuthGuard)
@UseFilters(HttpExceptionFilter)
export class ConversationsGateway implements OnGatewayConnection {
  handleConnection(client: any) {
    console.log('user connected', client);
  }

  @SubscribeMessage('example')
  handleMessage(
    @ConnectedSocket() socket: any,
    @MessageBody() data: string,
    @JWTUser() user: User,
  ): string {
    console.log('client', data, user, socket);
    return 'Hello world!';
  }
}
