import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ZodValidatorPipe } from 'src/common/pipes';
import { CreateConversationInput } from './dtos/conversations.service.dtos';
import { JWTUser } from 'src/auth/decorator/jwt-user.decorator';
import { User } from 'src/auth/type';
import { ConversationsService } from './conversations.service';
import {
  conversationIdSchemaValidator,
  createConversationSchemaValidator,
} from './validators/conversations.validators';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('')
  async createConversation(
    @Body(new ZodValidatorPipe(createConversationSchemaValidator))
    input: CreateConversationInput,
    @JWTUser() user: User,
  ) {
    return this.conversationsService.createConversation(input, { user });
  }

  @Get(':conversationId')
  async getConversation(
    @Param(
      'conversationId',
      new ZodValidatorPipe(conversationIdSchemaValidator),
    )
    conversationId: number,
    @JWTUser() user: User,
  ) {
    return this.conversationsService.getFullConversation(conversationId, {
      user,
      isController: true,
    });
  }
}
