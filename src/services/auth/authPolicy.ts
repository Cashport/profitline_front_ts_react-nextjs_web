import { API, ApiError } from "@/utils/api/api";
import {
  IAuthActionResponse,
  ILoginStatusData,
  ILoginStatusResponse
} from "@/types/auth/authPolicy";

export const getLoginStatus = async (): Promise<ILoginStatusData> => {
  const response: ILoginStatusResponse = await API.post("/auth/login-status");
  return response.data;
};

export const sendLoginOtp = async (): Promise<IAuthActionResponse> => {
  return API.post("/auth/otp/send");
};

export const verifyLoginOtp = async (otp: string): Promise<IAuthActionResponse> => {
  return API.post("/auth/otp/verify", { otp });
};

export const changePassword = async (password: string): Promise<IAuthActionResponse> => {
  return API.post("/auth/change-password", { password });
};

export const confirmPasswordReset = async (
  oobCode: string,
  newPassword: string
): Promise<IAuthActionResponse> => {
  return API.post("/auth/reset-password/confirm", { oobCode, newPassword });
};

export { ApiError };
