import { IsString } from "class-validator";

export class updateHashRefreshTokenDTO {
  @IsString()
  userId: string;
  @IsString()
  hashedRefreshToken: string;
}
