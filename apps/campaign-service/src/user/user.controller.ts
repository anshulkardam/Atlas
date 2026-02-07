import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { updateHashRefreshTokenDTO } from './dto/updateRefreshTokenPayload.dto.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  createUser(@Body() createUserPayload: CreateUserDto) {
    return this.userService.create(createUserPayload);
  }

  @Post('login')
  loginUser(@Body() loginPayload: LoginUserDto) {
    return this.userService.validateUser(loginPayload);
  }

  @Post('updateHashRT')
  updateHashRefreshToken(@Body() payload: updateHashRefreshTokenDTO) {
    return this.userService.updateHashedRefreshToken(
      payload.userId,
      payload.hashedRefreshToken,
    );
  }

  @Get('getRefreshToken')
  getUserRefreshToken(@Query() userId: string) {
    return this.userService.getRefreshToken(userId);
  }
}
