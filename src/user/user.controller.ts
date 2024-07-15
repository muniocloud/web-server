import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { JWTUser as JWTUserType } from 'src/auth/type';
import { JWTUser } from 'src/auth/decorator/jwt-user.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  public async getUser(@JWTUser() user: JWTUserType) {
    return this.userService.getUser(user);
  }
}
