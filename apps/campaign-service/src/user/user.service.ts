import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { hash, verify } from 'argon2';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { OAuthPayload } from './dto/oauth-user.dto.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...user } = createUserDto;

    const userExists = await this.findbyEmail(user.email);

    if (userExists) throw new ConflictException('User Already Exists');

    const hashedPassword = await hash(password);

    return await this.prisma.user.create({
      data: {
        password: hashedPassword,
        provider: 'LOCAL',
        ...user,
      },
      select: {
        email: true,
        name: true,
        id: true,
      },
    });
  }

  async validateUser(loginPayload: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginPayload.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const verifyPassword = await verify(user.password, loginPayload.password);

    if (!verifyPassword) throw new UnauthorizedException('Invalid Credentials');

    return { id: user.id, name: user.name, email: user.email };
  }

  async findOrCreateUser(payload: OAuthPayload) {
    const user = await this.findbyEmail(payload.email);

    if (user) return user;

    return await this.prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        provider: 'GOOGLE',
        providerId: payload.providerId,
      },
      select: {
        email: true,
        id: true,
        name: true,
      },
    });
  }

  async logout(id: string) {
    return this.updateHashedRefreshToken(id, null);
  }

  async findbyId(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async findbyEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      select: { email: true, id: true, name: true },
    });
  }

  async updateHashedRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRefreshToken,
      },
    });
  }

  async getRefreshToken(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: { hashedRefreshToken: true },
    });
  }
}
