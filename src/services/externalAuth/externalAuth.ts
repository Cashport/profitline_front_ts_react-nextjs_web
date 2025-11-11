import axios, { AxiosResponse } from "axios";
import config from "@/config";
import { ISendOtpResponse, IValidateOtpResponse } from "@/types/externalAuth/externalAuth";

export const sendOtp = async (email: string, token: string): Promise<ISendOtpResponse> => {
  try {
    const response: AxiosResponse<ISendOtpResponse> = await axios.post(
      `${config.API_HOST}/email-otp`,
      {
        email
      },
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("error sending otp: ", error);
    throw error;
  }
};

export const validateOtp = async (
  email: string,
  otp: string,
  token: string
): Promise<IValidateOtpResponse> => {
  try {
    const response: AxiosResponse<IValidateOtpResponse> = await axios.post(
      `${config.API_HOST}/email-otp/validate`,
      {
        email,
        otp,
        token
      },
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("error validating otp: ", error);
    throw error;
  }
};

export const sendMailLink = async (email: string): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await axios.post(
      `${config.API_HOST}/email-otp/send-mail`,
      {
        email
      }
    );

    return response.data;
  } catch (error) {
    console.error("error sending mail link: ", error);
    throw error;
  }
};
