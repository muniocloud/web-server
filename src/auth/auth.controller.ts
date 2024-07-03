import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
} from '@nestjs/common';
import { LocalAuthGuard } from './guard';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZodValidatorPipe } from 'src/utils/zod/zod-validator.pipe';
import { signupInputSchemaValidator } from './validator';
import { SignUpInput } from './type';
import { JwtAuthGuard } from './guard/jwt.guard';
import { avatarSchemaValidator } from './validator/avatar.validator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    return this.authService.createJWTToken(req.user);
  }

  @Post('signup')
  @UseInterceptors(FileInterceptor('avatar'))
  async signup(
    @UploadedFile(new ZodValidatorPipe(avatarSchemaValidator))
    avatar: Express.Multer.File,
    @Body(new ZodValidatorPipe(signupInputSchemaValidator)) input: SignUpInput,
  ) {
    return this.authService.createUser({
      ...input,
      avatar,
    });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async checkprof() {
    return true;
  }
}
