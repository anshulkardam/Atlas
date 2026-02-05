import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard.js';
import { type AuthUser, User } from '../user/user.decorator.js';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard.js';

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
}
