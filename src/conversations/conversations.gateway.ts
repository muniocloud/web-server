import { UseFilters, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { WsJwtAuthGuard } from 'src/auth/guard/ws-jwt.guard';
import { HttpExceptionFilter } from './filter/http.filter';
import { JWTUser } from 'src/auth/decorator/ws-jwt-user.decorator';
import { User } from 'src/auth/type';
import { Socket } from 'socket.io';
import { ZodValidatorPipe } from 'src/utils/zod/zod-validator.pipe';
import {
  conversationWsSendMessage,
  conversationWsSetup,
} from './conversations.validators';
import {
  ConversationSendMessageInput,
  ConversationSetupInput,
} from './conversations.types';
import { ConversationsService } from './conversations.service';
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
    @MessageBody(new ZodValidatorPipe(conversationWsSetup))
    data: ConversationSetupInput,
    @JWTUser() user: User,
  ) {
    this.conversationsService.handleSetupConversation(
      {
        conversationId: data.conversationId,
      },
      {
        user,
        socket,
      },
    );
  }

  @SubscribeMessage('send')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody(new ZodValidatorPipe(conversationWsSendMessage))
    data: ConversationSendMessageInput,
    @JWTUser() user: User,
  ) {
    this.conversationsService.handleSendMessage(
      {
        audio: data.audio,
        conversationId: data.conversationId,
        mimetype: data.mimetype,
      },
      {
        user,
        socket,
      },
    );
  }
}
