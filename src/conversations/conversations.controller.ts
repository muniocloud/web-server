import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ZodValidatorPipe } from 'src/utils/zod/zod-validator.pipe';
import { createConversationSchemaValidator } from './validator';
import { CreateConversationInput } from './dto/conversations.dtos';
import { JWTUser } from 'src/auth/decorator/jwt-user.decorator';
import { User } from 'src/auth/type';
import { ConversationsService } from './conversations.service';

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
}
