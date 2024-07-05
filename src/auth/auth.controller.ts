import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { LocalAuthGuard } from './guard';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZodValidatorPipe } from 'src/utils/zod/zod-validator.pipe';
import { signupInputSchemaValidator } from './validator';
import { SignUpInput } from './type';
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
    const authUser = await this.authService.createUser({
      ...input,
      provider: 'local',
      avatar,
    });

    const jwtToken = await this.authService.createJWTToken(authUser);

    return {
      success: true,
      ...jwtToken,
    };
  }
}
