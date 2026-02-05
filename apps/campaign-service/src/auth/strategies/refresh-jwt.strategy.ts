import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { ConfigType } from '@nestjs/config';
import { JwtPayload } from '../types/jwtPayload.js';
import { AuthService } from '../auth.service.js';
import refreshAuthConfig from '../config/refresh-auth.config.js';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshAuthConfig.KEY)
    private jwtConfig: ConfigType<typeof refreshAuthConfig>,
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
    return this.authService.validateRefreshUserToken(userId);
  }
}
