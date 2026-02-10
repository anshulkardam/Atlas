import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { ConfigType } from '@nestjs/config';
import { JwtPayload } from '../types/jwtPayload.js';
import { AuthService } from '../auth.service.js';
import refreshAuthConfig from '../config/refresh-auth.config.js';
import { Request } from 'express';

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
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refresh_token as string,
      ]),
      secretOrKey: jwtConfig.secret as string,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const userId = payload.sub;
    const refreshToken = req.cookies.refresh_token as string;

    return this.authService.validateRefreshUserToken(userId, refreshToken);
  }
}
