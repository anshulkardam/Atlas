import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { verify } from 'argon2';
import { JwtPayload } from './types/jwtPayload.js';
import { JwtService } from '@nestjs/jwt';
import { type ConfigType } from '@nestjs/config';
import refreshAuthConfig from './config/refresh-auth.config.js';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshAuthConfig.KEY)
    private refreshConfig: ConfigType<typeof refreshAuthConfig>,
  ) {}
  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findbyEmail(createUserDto.email);

    if (user) throw new ConflictException('User already Exists');

    return await this.userService.create(createUserDto);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findbyEmail(email);

    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const verifyPassword = await verify(user.password, password);

    if (!verifyPassword) throw new UnauthorizedException('Invalid Credentials');

    return { id: user.id, name: user.name };
  }

  async loginUser(userId: string, name?: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    return {
      id: userId,
      name: name,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: string) {
    const payload: JwtPayload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshConfig),
    ]);

    return { accessToken, refreshToken };
  }

  async validateJwtUser(userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const currentUser = { id: user.id };

    return currentUser;
  }

  async validateRefreshUserToken(userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const currentUser = { id: user.id };

    return currentUser;
  }

  async refreshTokens(userId: string, name: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    return {
      id: userId,
      name: name,
      accessToken,
      refreshToken,
    };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findbyEmail(googleUser.email);

    if (user) return user;

    return await this.userService.create(googleUser);
  }
}
