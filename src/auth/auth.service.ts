import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthUser, CreateUserAndAuthUserInput } from './type/authuser.type';
import { JwtService } from '@nestjs/jwt';
import { JWTUser } from './type';
import { AuthRepository } from './auth.repository';
import { Knex } from 'knex';
import { DATA_SOURCE_PROVIDER } from 'src/database/database.constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private authRepository: AuthRepository,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    @Inject(DATA_SOURCE_PROVIDER) private dataSource: Knex,
  ) {}

  async getAuthUserByEmail(email: string): Promise<AuthUser | null> {
    const authUser = await this.authRepository.findByEmail(email);

    if (!authUser) {
      return null;
    }

    return authUser;
  }

  async isValidPassword(authUser: AuthUser | null, inputPassword: string) {
    return (
      !!authUser?.password &&
      bcrypt.compareSync(inputPassword, authUser.password)
    );
  }

  async getAuthUser(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.getAuthUserByEmail(email);
    const isValidPassword = await this.isValidPassword(user, password);
    return isValidPassword ? user : null;
  }

  async createUser(input: CreateUserAndAuthUserInput): Promise<AuthUser> {
    const authUser = await this.getAuthUserByEmail(input.email);

    if (authUser) {
      throw new UnauthorizedException('User already exists.');
    }

    const trx = await this.dataSource.transaction();

    const userId = await this.userService.createUser(
      {
        name: input.name,
        avatar: input.avatar,
      },
      trx,
    );

    const rounds = parseInt(
      this.configService.getOrThrow('BCRYPT_PASSWORD_HASH'),
    );

    const passwordHash = bcrypt.hashSync(input.password, rounds);

    const authUserId = await this.authRepository.createAuthUser(
      {
        email: input.email,
        password: passwordHash,
        provider: input.provider,
        userId,
      },
      trx,
    );

    trx.commit();

    return {
      userId,
      email: input.email,
      id: authUserId,
      password: passwordHash,
      provider: input.provider,
    };
  }

  async createJWTToken(user: AuthUser) {
    const payload: JWTUser = { email: user.email, id: user.userId };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async isValidJWTUser(jwtUser: JWTUser) {
    const user = await this.getAuthUserByEmail(jwtUser.email);
    return user?.userId === jwtUser.id;
  }
}
