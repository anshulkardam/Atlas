import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { hash, verify } from 'argon2';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';

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
        ...user,
      },
    });
  }

  async validateUser(loginPayload: LoginUserDto) {
    const user = await this.findbyEmail(loginPayload.email);

    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const verifyPassword = await verify(user.password, loginPayload.password);

    if (!verifyPassword) throw new UnauthorizedException('Invalid Credentials');

    return { id: user.id, name: user.name };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.findbyEmail(googleUser.email);

    if (user) return user;

    return await this.create(googleUser);
  }

  async logout(id: string) {
    return this.updateHashedRefreshToken(id, null);
  }

  async findbyId(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async findbyEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email: email } });
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
