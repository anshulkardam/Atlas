import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserService } from '../user/user.service.js';
import { PrismaService } from '../prisma.service.js';
import { JwtModule } from '@nestjs/jwt';
import authConfig from './config/auth.config.js';
import { ConfigModule } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import refreshAuthConfig from './config/refresh-auth.config.js';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy.js';
import googleConfig from './config/google.config.js';

@Module({
  imports: [
    JwtModule.registerAsync(authConfig.asProvider()),
    ConfigModule.forFeature(authConfig),
    ConfigModule.forFeature(refreshAuthConfig),
    ConfigModule.forFeature(googleConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    PrismaService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
  ],
})
export class AuthModule {}
