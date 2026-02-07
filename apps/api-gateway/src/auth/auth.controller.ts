import {
  Body,
  Controller,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { type Response } from 'express';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUser: CreateUserDto) {
    return this.authService.register(createUser);
  }

  @Post('login')
  login(@Body() loginPayload: LoginUserDto) {
    return this.authService.login(loginPayload.email, loginPayload.password);
  }

  @UseGuards(GoogleAuthGuard)
  @Post('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Post('google/callback')
  async googleLoginCallback(@Request() req, @Res() res: Response) {
    await this.authService.login(req.user.id, req.user.name);

    res.redirect(
      `http://localhost:3000/auth/callback?accessToken=${accessToken}`,
    );
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Request() req) {
    return this.authService.refreshTokens(req.id, req.name);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req) {
    return this.authService.logout(req.id);
  }
}
