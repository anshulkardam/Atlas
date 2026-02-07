import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService, type ConfigType } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import refreshAuthConfig from './config/refresh-auth.config';
import { JwtPayload } from './types/jwtPayload';
import { AxiosError } from 'axios';
import {
  RegisterApiResponse,
  LoginApiResponse,
  getRefreshToken,
} from '@repo/common';

@Injectable()
export class AuthService {
  private readonly campaignServiceUrl: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    @Inject(refreshAuthConfig.KEY)
    private refreshConfig: ConfigType<typeof refreshAuthConfig>,
  ) {
    this.campaignServiceUrl = this.configService.get('CAMPAIGN_SERVICE_URL')!;
  }

  async register(createUser: CreateUserDto) {
    try {
      const user = await firstValueFrom(
        this.httpService.post<RegisterApiResponse>(
          `${this.campaignServiceUrl}/api/user/register`,
          {
            ...createUser,
          },
        ),
      );

      const { accessToken, refreshToken } = await this.generateTokens(
        user.data.id,
      );
      const hashedRefreshToken = await hash(refreshToken);

      await firstValueFrom(
        this.httpService.post(
          `${this.campaignServiceUrl}/api/user/updateHashRT`,
          {
            userId: user.data.id,
            hashedRefreshToken,
          },
        ),
      );

      return {
        id: user.data.id,
        name: user.data.name,
        email: user.data.email,
        accessToken,
        refreshToken,
      };
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const { status, data } = err.response as {
          status: number;
          data?: { message?: string };
        };

        if (status === 409) {
          throw new ConflictException(data?.message);
        }

        throw new InternalServerErrorException(
          data?.message ?? 'Upstream service error',
        );
      }

      throw err;
    }
  }

  async login(email: string, password: string) {
    const response = await firstValueFrom(
      this.httpService.post<LoginApiResponse>(
        `${this.campaignServiceUrl}/api/user/login`,
        {
          email,
          password,
        },
      ),
    );

    const { accessToken, refreshToken } = await this.generateTokens(
      response.data.id,
    );
    const hashedRefreshToken = await hash(refreshToken);

    await firstValueFrom(
      this.httpService.post(
        `${this.campaignServiceUrl}/api/user/updateHashRT`,
        {
          userId: response.data.id,
          hashedRefreshToken,
        },
      ),
    );

    return {
      id: response.data.id,
      name: response.data.name,
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

  async validateRefreshUserToken(userId: string, refreshToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get<getRefreshToken>(
          `${this.campaignServiceUrl}/api/user/getRefreshToken?userId=${userId}`,
        ),
      );

      const hashedRefreshToken = response.data.hashedRefreshToken;

      if (!hashedRefreshToken)
        throw new UnauthorizedException('Invalid Refresh Token');

      const verifyRefreshToken = await verify(hashedRefreshToken, refreshToken);

      if (!verifyRefreshToken)
        throw new UnauthorizedException('Invalid Refresh Token');

      const currentUser = { id: userId };

      return currentUser;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async refreshTokens(userId: string, name: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    const hashedRefreshToken = await hash(refreshToken);

    await firstValueFrom(
      this.httpService.post(
        `${this.campaignServiceUrl}/api/user/updateHashRT`,
        {
          userId: userId,
          hashedRefreshToken,
        },
      ),
    );

    return {
      id: userId,
      name: name,
      accessToken,
      refreshToken,
    };
  }

  async validateGoogleUser({ email, name }: { email: string; name: string }) {
    const user = await firstValueFrom(
      this.httpService.get(
        `${this.campaignServiceUrl}/api/user?email=${email}`,
      ),
    );

    if (user) return user;

    const createUser = this.register({ email, name, password: '' });
    return createUser;
  }

  async logout(id: string) {
    await firstValueFrom(
      this.httpService.post(
        `${this.campaignServiceUrl}/api/user/deleteRefreshToken`,
        {
          id,
        },
      ),
    );
  }
}
