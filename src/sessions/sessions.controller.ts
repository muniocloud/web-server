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
import { ZodValidatorPipe } from 'src/utils/zod/zod-validator.pipe';
import {
  audioFileSchemaValidator,
  createSessionSchemaInput,
  idSchema,
} from './validator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SessionsService } from './sessions.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSessionInput } from './dto/sessions.service.dto';
import { JWTUser } from 'src/auth/decorator/jwt-user.decorator';
import { User } from 'src/auth/type';

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
    return this.sessionsService.getUserSessions({
      userId: user.id,
    });
  }

  @Get(':session')
  async getSession(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @JWTUser() user: User,
  ) {
    return this.sessionsService.getUserSession({
      sessionId,
      userId: user.id,
    });
  }

  @Get(':session/lessons/status')
  async getLessonsStatus(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @JWTUser() user: User,
  ) {
    return this.sessionsService.getLessonsStatus({
      sessionId,
      userId: user.id,
    });
  }

  @Get(':session/result')
  async getSessionResult(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @JWTUser() user: User,
  ) {
    return this.sessionsService.createOrGetSessionResult(
      {
        sessionId,
      },
      { user },
    );
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
    @UploadedFile(new ZodValidatorPipe(audioFileSchemaValidator))
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
