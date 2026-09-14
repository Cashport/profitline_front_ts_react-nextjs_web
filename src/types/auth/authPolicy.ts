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

export interface IVerifyOtpResponse extends IAuthActionResponse {
  // Presente solo cuando el proyecto permite dispositivos de confianza: es el
  // token que el navegador guarda para no volver a recibir el reto OTP hasta
  // que venza la configuración del proyecto.
  data?: {
    deviceToken: string | null;
  };
}
