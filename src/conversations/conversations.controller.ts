import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ZodValidatorPipe } from 'src/utils/zod/zod-validator.pipe';
import {
  conversationIdSchemaValidator,
  createConversationSchemaValidator,
} from './conversations.validators';
import { CreateConversationInput } from './conversations.dtos';
import { JWTUser } from 'src/auth/decorator/jwt-user.decorator';
import { User } from 'src/auth/type';
import { ConversationsService } from './conversations.service';
import { sleep } from 'src/utils/sleep';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

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
    await sleep(1000);
    return this.conversationsService.getFullConversation(
      {
        id: conversationId,
      },
      { user },
    );
  }
}
