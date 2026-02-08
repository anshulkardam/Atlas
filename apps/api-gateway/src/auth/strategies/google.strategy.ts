import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleConfig from '../config/google.config.js';
import { type ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleConfig.KEY)
    private readonly googleAuth: ConfigType<typeof googleConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: googleAuth.clientID,
      clientSecret: googleAuth.ClientSecret,
      callbackURL: googleAuth.callbackURL,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string;
      displayName: string;
      emails?: Array<{ value: string }>;
      [key: string]: any;
    },
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      return done(new Error('Google account does not have an email'), false);
    }

    const user = await this.authService.findOrCreateGoogleUser({
      email,
      name: profile.displayName,
      providerId: profile.id,
    });

    done(null, user);
  }
}
