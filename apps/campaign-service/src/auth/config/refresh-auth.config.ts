import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';

export default registerAs(
  'refresh-jwt',
  (): JwtSignOptions => ({
    secret: process.env.JWT_SECRET,

    expiresIn: Number(process.env.JWT_EXPIRES_IN),
  }),
);
