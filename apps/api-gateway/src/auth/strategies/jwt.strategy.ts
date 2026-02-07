import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { ConfigType } from '@nestjs/config';
import { JwtPayload } from '../types/jwtPayload.js';
import { AuthService } from '../auth.service.js';
import jwtConfig from '../config/jwt.config.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY) private jwt: ConfigType<typeof jwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwt.secret as string,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload) {
    console.log('fas', payload);
    const userId = payload.sub;
    console.log(userId);
    return { id: userId };
  }
}
