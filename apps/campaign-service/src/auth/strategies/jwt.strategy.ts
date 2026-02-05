import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import authConfig from '../config/auth.config.js';
import type { ConfigType } from '@nestjs/config';
import { JwtPayload } from '../types/jwtPayload.js';
import { AuthService } from '../auth.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(authConfig.KEY) private jwtConfig: ConfigType<typeof authConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.secret as string,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload) {
    console.log('fas', payload);
    const userId = payload.sub;
    console.log(userId);
    return this.authService.validateJwtUser(userId);
  }
}
