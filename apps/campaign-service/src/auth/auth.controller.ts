import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard.js';
import { type AuthUser, User } from '../user/user.decorator.js';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard.js';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard.js';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUser: CreateUserDto) {
    return this.authService.registerUser(createUser);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@User() req: AuthUser) {
    return this.authService.loginUser(req.id, req.name);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleLoginCallback(@Request() req, @Res() res: Response) {
    const response = await this.authService.loginUser(
      req.user.id,
      req.user.name,
    );

    res.redirect(`callback/userid,name,`);
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getAll(@User() req: AuthUser) {
    return req;
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@User() req: AuthUser) {
    return this.authService.refreshTokens(req.id, req.name);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req) {
    return this.authService.logout(req.user.id);
  }
}
