export interface ILoginStatusData {
  requiresOtp: boolean;
  requiresPasswordChange: boolean;
  email: string;
}

export interface ILoginStatusResponse {
  status: number;
  message?: string;
  data: ILoginStatusData;
}

export interface IAuthActionResponse {
  status: number;
  message: string;
}
