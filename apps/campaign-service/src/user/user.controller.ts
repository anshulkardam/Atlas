import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from '../auth/dto/create-user.dto.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
