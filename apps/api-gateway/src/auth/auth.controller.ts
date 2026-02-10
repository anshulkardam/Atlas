import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import type { Request as ExpressRequest, Response } from 'express';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { type AuthUser } from './decorator/user.decorator';

interface GoogleUser {
  email: string;
  name: string;
  sub: string;
}

type RequestWithUser = ExpressRequest & { user: GoogleUser };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() createUser: CreateUserDto,
  ) {
    const { refreshToken, ...session } =
      await this.authService.register(createUser);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return session;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginPayload: LoginUserDto,
  ) {
    const { refreshToken, ...session } =
      await this.authService.loginWithPassword(
        loginPayload.email,
        loginPayload.password,
      );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return session;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleLoginCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    await this.authService.findOrCreateGoogleUser({
      email: req.user.email,
      name: req.user.name,
      providerId: req.user.sub,
    });

    res.redirect('http://localhost:5173');
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() req: AuthUser) {
    const session = await this.authService.refreshTokens(
      req.user.id,
      req.user.name,
    );

    return session;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req: AuthUser) {
    return this.authService.logout(req.user.id);
  }
}
