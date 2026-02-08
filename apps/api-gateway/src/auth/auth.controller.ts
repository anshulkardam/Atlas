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
  register(@Body() createUser: CreateUserDto) {
    return this.authService.register(createUser);
  }

  @Post('login')
  login(@Body() loginPayload: LoginUserDto) {
    return this.authService.loginWithPassword(
      loginPayload.email,
      loginPayload.password,
    );
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
  refreshToken(@Request() req: AuthUser) {
    return this.authService.refreshTokens(req.id, req.name);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req: AuthUser) {
    return this.authService.logout(req.id);
  }
}
