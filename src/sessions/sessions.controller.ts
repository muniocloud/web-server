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
import { User } from 'src/auth/decorator/authuser.decorator';
import { AuthUser } from 'src/auth/type/authuser.type';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SessionsService } from './sessions.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSessionInput } from './dto/sessions.dto';

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

  @Get(':session/lessons/:lesson')
  @UseGuards(JwtAuthGuard)
  async getLesson(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @Param('lesson', new ZodValidatorPipe(idSchema)) lessonId: number,
    @User() user: AuthUser,
  ) {
    return this.sessionsService.getLesson(
      {
        lessonId,
        sessionId,
      },
      user,
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
    @User() user: AuthUser,
  ) {
    return this.sessionsService.answerLesson({
      audio,
      lessonId,
      sessionId,
      user,
    });
  }

  @Get(':session/result')
  @UseGuards(JwtAuthGuard)
  async getSessionResult(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @User() user: AuthUser,
  ) {
    return this.sessionsService.createOrGetSessionResult({
      sessionId,
      user,
    });
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getUserSessions(@User() user: AuthUser) {
    return this.sessionsService.getUserSessions({
      userId: user.id,
    });
  }

  @Get(':session')
  @UseGuards(JwtAuthGuard)
  async getSession(
    @Param('session', new ZodValidatorPipe(idSchema)) sessionId: number,
    @User() user: AuthUser,
  ) {
    return this.sessionsService.getUserSession({
      sessionId,
      userId: user.id,
    });
  }
}
