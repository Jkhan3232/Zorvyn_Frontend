export type FrontendRole = "admin" | "analyst" | "viewer";
export type BackendRole = "admin" | "staff" | "user";
export type UserStatus = "active" | "inactive";

export interface ApiSuccess<TData> {
  success: true;
  message: string;
  data: TData;
}

export interface ApiValidationIssue {
  field: string;
  message: string;
}

export interface ApiValidationError {
  success: false;
  message: string;
  errors: ApiValidationIssue[];
}

export interface ApiAuthError {
  success: false;
  message: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: FrontendRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export type LoginResponse = ApiSuccess<LoginData>;

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenData {
  token: string;
  accessToken: string;
}

export type RefreshTokenResponse = ApiSuccess<RefreshTokenData>;

export interface LogoutRequest {
  refreshToken: string;
}

export type LogoutResponse = ApiSuccess<Record<string, never>>;

export interface UpdateAdminProfileRequest {
  name?: string;
  email?: string;
  password?: string;
}

export type UpdateAdminProfileResponse = ApiSuccess<AuthUser>;

export interface UpdateUserByAdminRequest {
  name?: string;
  email?: string;
  role?: FrontendRole;
  status?: UserStatus;
  isActive?: boolean;
}

export type UpdateUserByAdminResponse = ApiSuccess<AuthUser>;

export type OpenApiJson = Record<string, unknown>;
