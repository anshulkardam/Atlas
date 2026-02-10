import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { updateHashRefreshTokenDTO } from './dto/updateRefreshTokenPayload.dto.js';
import { type Request } from 'express';
import { OAuthPayload } from './dto/oauth-user.dto.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findUser(@Req() req: Request, @Query() query: { email: string }) {
    return this.userService.findbyEmail(query.email);
  }

  @Post('register')
  createUser(@Body() createUserPayload: CreateUserDto) {
    return this.userService.create(createUserPayload);
  }

  @Post('login')
  loginUser(@Body() loginPayload: LoginUserDto) {
    return this.userService.validateUser(loginPayload);
  }

  @Post('oauth')
  OAuth(@Body() payload: OAuthPayload) {
    return this.userService.findOrCreateUser(payload);
  }

  @Post('updateHashRT')
  updateHashRefreshToken(@Body() payload: updateHashRefreshTokenDTO) {
    return this.userService.updateHashedRefreshToken(
      payload.userId,
      payload.hashedRefreshToken,
    );
  }

  @Get('getRefreshToken')
  getUserRefreshToken(@Query() payload: { userId: string }) {
    return this.userService.getRefreshToken(payload.userId);
  }
}
