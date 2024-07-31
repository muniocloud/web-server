import { UseFilters, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { WsJwtAuthGuard } from 'src/auth/guard/ws-jwt.guard';
import { HttpExceptionFilter } from './filters/http.filter';
import { JWTUser } from 'src/auth/decorator/ws-jwt-user.decorator';
import { User } from 'src/auth/type';
import { Socket } from 'socket.io';
import {
  ConversationSendMessageInput,
  ConversationSetupInput,
} from './conversations.types';
import { ConversationsService } from './conversations.service';
import { ZodValidatorPipe } from 'src/common/pipes';
import {
  conversationSendMessage,
  conversationSetup,
} from './validators/conversations.validators';
@WebSocketGateway({
  namespace: 'conversations',
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtAuthGuard)
@UseFilters(HttpExceptionFilter)
export class ConversationsGateway {
  constructor(private readonly conversationsService: ConversationsService) {}

  @SubscribeMessage('setup')
  async setupConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody(new ZodValidatorPipe(conversationSetup))
    data: ConversationSetupInput,
    @JWTUser() user: User,
  ) {
    return this.conversationsService.handleSetupConversation(
      data.conversationId,
      {
        user,
        socket,
      },
    );
  }

  @SubscribeMessage('send')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody(new ZodValidatorPipe(conversationSendMessage))
    data: ConversationSendMessageInput,
    @JWTUser() user: User,
  ) {
    return this.conversationsService.handleSendMessage(data, {
      user,
      socket,
    });
  }
}
