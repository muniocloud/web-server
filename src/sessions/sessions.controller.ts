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
import { JWTUser as JWTUserType } from 'src/auth/type';

@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  async createSession(
    @Body(new ZodValidatorPipe(createSessionSchemaInput))
    input: CreateSessionInput,
    @JWTUser() user: JWTUserType,
  ) {
    return this.sessionsService.createSession(input, { user });
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getUserSessions(@JWTUser() user: JWTUserType) {
    return this.sessionsService.getUserSessions({
      userId: user.id,
    });
  }

  @Get(':session')
  @UseGuards(JwtAuthGuard)
  async getSession(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @JWTUser() user: JWTUserType,
  ) {
    return this.sessionsService.getUserSession({
      sessionId,
      userId: user.id,
    });
  }

  @Get(':session/result')
  @UseGuards(JwtAuthGuard)
  async getSessionResult(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @JWTUser() user: JWTUserType,
  ) {
    return this.sessionsService.createOrGetSessionResult(
      {
        sessionId,
      },
      { user },
    );
  }

  @Get(':session/lessons/:lesson')
  @UseGuards(JwtAuthGuard)
  async getLesson(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @Param('lesson', new ZodValidatorPipe(idSchema)) lessonId: number,
    @JWTUser() user: JWTUserType,
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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio'))
  async answerLesson(
    @UploadedFile(new ZodValidatorPipe(audioFileSchemaValidator))
    audio: Express.Multer.File,
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @Param('lesson', new ZodValidatorPipe(idSchema)) lessonId: number,
    @JWTUser() user: JWTUserType,
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
