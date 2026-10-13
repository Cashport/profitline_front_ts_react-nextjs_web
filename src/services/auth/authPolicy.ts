import { API, ApiError } from "@/utils/api/api";
import {
  IAuthActionResponse,
  ILoginStatusData,
  ILoginStatusResponse,
  IVerifyOtpResponse
} from "@/types/auth/authPolicy";
import { getDeviceToken, setDeviceToken } from "@/utils/auth/trustedDevice";

/**
 * `API` lanza ApiError ante cualquier 4xx/5xx, pero LoginForm consume estas dos
 * funciones comprobando `result.status !== 200` sin try/catch. Sin esta
 * normalización un OTP inválido o el cooldown de reenvío dejaban el formulario
 * cargando y sin mensaje. `changePassword` y `confirmPasswordReset` NO se
 * normalizan: ChangePassForm sí las envuelve en try/catch y depende de que
 * lancen.
 */
const toActionResponse = (error: unknown): IAuthActionResponse => {
  if (error instanceof ApiError) {
    return { status: error.status ?? 500, message: error.message };
  }
  return {
    status: 500,
    message: "No se pudo completar la operación. Por favor intenta de nuevo."
  };
};

export const getLoginStatus = async (): Promise<ILoginStatusData> => {
  // El token de dispositivo viaja solo en las llamadas /auth/*, nunca en el
  // interceptor global.
  const deviceToken = getDeviceToken();
  const response: ILoginStatusResponse = await API.post(
    "/auth/login-status",
    {},
    deviceToken ? { headers: { "x-device-token": deviceToken } } : undefined
  );
  return response.data;
};

export const sendLoginOtp = async (): Promise<IAuthActionResponse> => {
  try {
    const response: IAuthActionResponse = await API.post("/auth/otp/send");
    return { status: response?.status ?? 200, message: response?.message ?? "" };
  } catch (error) {
    return toActionResponse(error);
  }
};

export const verifyLoginOtp = async (otp: string): Promise<IAuthActionResponse> => {
  try {
    const response: IVerifyOtpResponse = await API.post("/auth/otp/verify", { otp });
    // Si el proyecto permite dispositivos de confianza, se guarda el token para
    // que este equipo no vuelva a recibir el reto hasta que venza.
    setDeviceToken(response?.data?.deviceToken ?? null);
    return { status: response?.status ?? 200, message: response?.message ?? "" };
  } catch (error) {
    return toActionResponse(error);
  }
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
