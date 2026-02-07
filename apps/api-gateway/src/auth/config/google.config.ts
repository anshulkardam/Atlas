import { registerAs } from '@nestjs/config';

export default registerAs('googleAuth', () => ({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  ClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_REDIRECT_API_URL!,
}));
