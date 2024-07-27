import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ZodValidatorPipe } from 'src/utils/zod/zod-validator.pipe';
import { createConversationSchemaValidator } from './validator';
import { CreateConversationInput } from './dto/conversations.dtos';
import { JWTUser } from 'src/auth/decorator/jwt-user.decorator';
import { JWTUser as JWTUserType } from 'src/auth/type';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  async createConversation(
    @Body(new ZodValidatorPipe(createConversationSchemaValidator))
    input: CreateConversationInput,
    @JWTUser() user: JWTUserType,
  ) {
    return this.conversationsService.createConversation(input, { user });
  }
}
