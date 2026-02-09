export interface RegisterApiResponse {
  id: string;
  name: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export type LoginApiResponse = RegisterApiResponse;

export type OAuthApiResponse = Omit<RegisterApiResponse, "accessToken" | "refreshToken">;

export type getRefreshToken = {
  hashedRefreshToken: string;
};
