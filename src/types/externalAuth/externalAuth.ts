export interface ISendOtpResponse {
  code: number;
  message: string;
}

export interface IExternalUser {
  id: number;
  role_id: number;
  firebase_uid: string;
  email: string;
  password: string;
  client_id: string;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
  auth: string;
}

export interface IValidateOtpResponse {
  code: number;
  message: string;
  data: IExternalUser;
}