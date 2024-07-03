import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ZodValidatorPipe } from 'src/utils/zod/zod-validator.pipe';
import { createSessionSchemaInput } from './validator';
import { CreateSessionInput } from './type/sessions.type';
import { User } from 'src/auth/decorator/authuser.decorator';
import { AuthUser } from 'src/auth/type/authuser.type';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  async createSession(
    @Body(new ZodValidatorPipe(createSessionSchemaInput))
    input: CreateSessionInput,
    @User() user: AuthUser,
  ) {
    return this.sessionsService.createSession(input, user);
  }
}
