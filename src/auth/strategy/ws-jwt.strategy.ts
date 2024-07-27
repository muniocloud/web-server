import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JWTPayload } from '../type';
import { AuthService } from '../auth.service';
import { ExtractWsJwt } from '../extractor/ws-jwt.extractor';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'ws-jwt') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractWsJwt.fromWsAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: JWTPayload) {
    const isValid = await this.authService.isValidJWTUser(payload);

    if (isValid) {
      return { email: payload.email, id: payload.id };
    }

    return null;
  }
}
