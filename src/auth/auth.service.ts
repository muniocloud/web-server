import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from 'src/user/user.dto';
import { ConfigService } from '@nestjs/config';
import { AuthUser } from './type/authuser.type';
import { User } from 'src/user/user.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async checkPassword(user: User | null, inputPassword: string) {
    return !!user?.password && bcrypt.compareSync(inputPassword, user.password);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await this.userService.getUserByEmail(email);
    const validUser = await this.checkPassword(user, password);

    if (validUser) {
      const { email, id } = user!;

      return {
        email,
        id: +id,
      };
    }

    return null;
  }

  async createUser(input: CreateUserInput) {
    const rounds = parseInt(
      this.configService.getOrThrow('BCRYPT_PASSWORD_HASH'),
    );

    const passwordHash = bcrypt.hashSync(input.password, rounds);

    return this.userService.createUser({
      ...input,
      password: passwordHash,
    });
  }

  async createJWTToken(user: AuthUser) {
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
