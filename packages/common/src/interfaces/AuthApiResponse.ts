export interface RegisterApiResponse {
  id: string;
  name: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export type LoginApiResponse = Omit<RegisterApiResponse, "email">;

export type getRefreshToken = {
  hashedRefreshToken: string;
};
