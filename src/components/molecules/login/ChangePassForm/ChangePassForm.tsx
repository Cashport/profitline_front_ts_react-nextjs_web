import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { Flex, Input, notification, Tooltip } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

import { Eye, EyeClosed } from "phosphor-react";

import "./changePassForm.scss";
import { useRouter, useSearchParams } from "next/navigation";
import { completeLoginAfterPasswordChange } from "../../../../../firebase-utils";
import { openNotification } from "@/components/atoms/Notification/Notification";
import { createPassword } from "@/services/users/users";
import { ApiError } from "@/utils/api/api";
import {
  changePassword,
  confirmPasswordReset as confirmPasswordResetApi
} from "@/services/auth/authPolicy";

interface IChangePassForm {
  password: string;
  confirmPassword: string;
}

const schema = yup.object().shape({
  password: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(32, "La contraseña no puede tener más de 32 caracteres")
    .matches(/[a-z]/, "La contraseña debe contener al menos una minúscula")
    .matches(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .matches(/\d/, "La contraseña debe contener al menos un número")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "La contraseña debe contener al menos un carácter especial")
    .required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required()
});

interface ChangePassFormProps {
  mode: "accept" | "reset" | "expired";
  // "expired" mode: the user is already Firebase-authenticated (they just
  // signed in with a soon-to-be-replaced password), so there is no URL
  // token to read - the email is passed down for display and for the
  // re-authentication step after the change succeeds.
  email?: string;
  // Lets the parent (Login.tsx) move to the OTP step if the same login
  // also requires periodic OTP validation once the password is updated.
  // eslint-disable-next-line no-unused-vars
  onRequireOtp?: (email: string) => void;
}

export const ChangePassForm = ({ mode, email, onRequireOtp }: ChangePassFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = mode === "expired" ? null : searchParams.get(mode === "accept" ? "token" : "oobCode");
  const copyText =
    mode === "accept"
      ? {
          title: "Crea una nueva contraseña",
          text: "Ingresa tu nueva contraseña"
        }
      : mode === "expired"
        ? {
            title: "Tu contraseña ha vencido",
            text: "Crea una nueva contraseña para continuar"
          }
        : {
            title: "Restablece tu contraseña",
            text: "Ingresa tu nueva contraseña"
          };
  const [api, contextHolder] = notification.useNotification();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<IChangePassForm>({
    resolver: yupResolver(schema),
    mode: "onTouched"
  });

  const [showPassword, setShowPassword] = useState<{
    password: boolean;
    confirmPassword: boolean;
  }>({
    password: false,
    confirmPassword: false
  });

  const onSubmitResetHandler = async ({ password }: IChangePassForm) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await confirmPasswordResetApi(token, password);
      openNotification({
        api: api,
        type: "success",
        title: "Contraseña restablecida",
        message: "Tu contraseña ha sido restablecida"
      });
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (error) {
      let message = "Hubo un error al restablecer la contraseña, pruebe mandar otro correo";
      if (error instanceof ApiError) {
        message = error.message;
      }
      openNotification({
        api: api,
        type: "error",
        title: "Error",
        message
      });
    }
    setIsLoading(false);
  };

  const onSubmitHandlerCreatePass = async ({ password }: IChangePassForm) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await createPassword(token, password);
      openNotification({
        api: api,
        type: "success",
        title: "Contraseña creada",
        message: "Tu contraseña ha sido creada"
      });
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (error) {
      let message = "Hubo un error al crear la contraseña, pruebe mandar otro correo";
      if (error instanceof ApiError) {
        message = error.message;
      }
      openNotification({
        api: api,
        type: "error",
        title: "Error",
        message: message
      });
    }
    setIsLoading(false);
  };
  const onSubmitExpiredHandler = async ({ password }: IChangePassForm) => {
    if (!email) return;
    setIsLoading(true);
    try {
      await changePassword(password);
      const outcome = await completeLoginAfterPasswordChange(email, password, router);
      if (outcome.step === "otp") {
        onRequireOtp?.(email);
      }
      // "success" already redirected inside completeLoginAfterPasswordChange.
    } catch (error) {
      let message = "Hubo un error al actualizar la contraseña, inténtalo de nuevo";
      if (error instanceof ApiError) {
        message = error.message;
      }
      openNotification({
        api: api,
        type: "error",
        title: "Error",
        message: message
      });
    }
    setIsLoading(false);
  };

  const onSubmitHandler =
    mode === "accept"
      ? onSubmitHandlerCreatePass
      : mode === "expired"
        ? onSubmitExpiredHandler
        : onSubmitResetHandler;
  if (mode !== "expired" && !token) return;
  if (mode === "expired" && !email) return;
  return (
    <form className="changePassForm" onSubmit={handleSubmit(onSubmitHandler)}>
      {contextHolder}
      <Flex vertical gap={"0.5rem"}>
        <h4 className="changePassForm__title">{copyText.title}</h4>
        <p>{copyText.text}</p>
      </Flex>

      <Flex vertical gap={"1.5rem"} className="changePassForm__content">
        <div>
          <p className="changePassForm__inputTitle">Nueva Contraseña</p>
          <Controller
            name="password"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <>
                <Input
                  size="large"
                  type={showPassword.password ? "text" : "password"}
                  className="inputPassword"
                  placeholder="Contrasena"
                  variant="borderless"
                  required
                  autoComplete="current-password"
                  onCopy={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onCut={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  suffix={
                    <Tooltip title={showPassword.password ? "Hidden Password" : "Show Password"}>
                      {!showPassword.password ? (
                        <Eye
                          onClick={() => {
                            setShowPassword((prevState) => ({
                              ...prevState,
                              password: true
                            }));
                          }}
                          className="iconEyePassword"
                        />
                      ) : (
                        <EyeClosed
                          onClick={() => {
                            setShowPassword((prevState) => ({
                              ...prevState,
                              password: false
                            }));
                          }}
                          className="iconEyePassword"
                        />
                      )}
                    </Tooltip>
                  }
                  {...field}
                />
                {errors.password && <div className="errorMessage">{errors.password.message}</div>}
              </>
            )}
          />
        </div>
        <div>
          <p className="changePassForm__inputTitle">Confirmar contraseña</p>
          <Controller
            name="confirmPassword"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <>
                <Input
                  size="large"
                  type={showPassword.confirmPassword ? "text" : "password"}
                  className="inputPassword"
                  placeholder="Contrasena"
                  variant="borderless"
                  required
                  autoComplete="current-password"
                  onCopy={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onCut={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  suffix={
                    <Tooltip
                      title={showPassword.confirmPassword ? "Hidden Password" : "Show Password"}
                    >
                      {!showPassword.confirmPassword ? (
                        <Eye
                          onClick={() =>
                            setShowPassword((prevState) => ({
                              ...prevState,
                              confirmPassword: true
                            }))
                          }
                          className="iconEyePassword"
                        />
                      ) : (
                        <EyeClosed
                          onClick={() =>
                            setShowPassword((prevState) => ({
                              ...prevState,
                              confirmPassword: false
                            }))
                          }
                          className="iconEyePassword"
                        />
                      )}
                    </Tooltip>
                  }
                  {...field}
                />
                {errors.confirmPassword && (
                  <div className="errorMessage">{errors.confirmPassword.message}</div>
                )}
              </>
            )}
          />
        </div>
      </Flex>

      <PrincipalButton disabled={!isValid} loading={isLoading} htmlType="submit">
        {mode === "expired" ? "Actualizar contraseña" : "Restablecer contraseña"}
      </PrincipalButton>
    </form>
  );
};
