import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SessionsService } from './sessions.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JWTUser } from 'src/auth/decorator/jwt-user.decorator';
import { User } from 'src/auth/type';
import { ZodValidatorPipe } from 'src/common/pipes';
import {
  createSessionSchemaInput,
  idSchema,
} from './validators/sessions.validators';
import { CreateSessionInput } from './dtos/sessions.dtos';
import { audioFileValidator } from 'src/common/validators';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post('')
  async createSession(
    @Body(new ZodValidatorPipe(createSessionSchemaInput))
    input: CreateSessionInput,
    @JWTUser() user: User,
  ) {
    return this.sessionsService.createSession(input, { user });
  }

  @Get('')
  async getUserSessions(@JWTUser() user: User) {
    return this.sessionsService.getUserSessions({ user });
  }

  @Get(':session')
  async getSession(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @JWTUser() user: User,
  ) {
    return this.sessionsService.getUserSession(sessionId, { user });
  }

  @Get(':session/lessons/status')
  async getLessonsStatus(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @JWTUser() user: User,
  ) {
    return this.sessionsService.getLessonsStatus(sessionId, { user });
  }

  @Get(':session/result')
  async getSessionResult(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @JWTUser() user: User,
  ) {
    return this.sessionsService.getSessionFeedback(sessionId, { user });
  }

  @Get(':session/lessons/:lesson')
  async getLesson(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @Param('lesson', new ZodValidatorPipe(idSchema)) lessonId: number,
    @JWTUser() user: User,
  ) {
    return this.sessionsService.getLesson(
      {
        lessonId,
        sessionId,
      },
      { user },
    );
  }

  @Post(':session/lessons/:lesson')
  @UseInterceptors(FileInterceptor('audio'))
  async answerLesson(
    @UploadedFile(new ZodValidatorPipe(audioFileValidator))
    audio: Express.Multer.File,
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @Param('lesson', new ZodValidatorPipe(idSchema)) lessonId: number,
    @JWTUser() user: User,
  ) {
    return this.sessionsService.answerLesson(
      {
        audio,
        lessonId,
        sessionId,
      },
      { user },
    );
  }
}
