import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { Flex, Input, Tooltip, notification } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "phosphor-react";

import { getAuth } from "../../../../../firebase-utils";

import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { openNotification } from "@/components/atoms/Notification/Notification";

import "./loginform.scss";
import { sendOtp, validateOtp } from "@/services/externalAuth/externalAuth";

interface IAuthLogin {
  email: string;
  password?: string;
  otp?: string;
}

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup
    .string()
    .min(5)
    .max(32)
    .when("$hasToken", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required()
    }),
  otp: yup
    .string()
    .length(6)
    .matches(/^\d{6}$/)
    .when("$isCodeSent", {
      is: true,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired()
    })
});

interface LoginFormProps {
  setResetPassword: Dispatch<SetStateAction<boolean>>;
  token: string | null;
}
export const LoginForm = ({ setResetPassword, token }: LoginFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isInvalidCode, setIsInvalidCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
    getValues
  } = useForm<IAuthLogin>({
    resolver: yupResolver(schema),
    context: { hasToken: !!token, isCodeSent: isCodeSent }
  });
  const [api, contextHolder] = notification.useNotification();

  const [showPassword, setShowPassword] = useState(false);

  const handleSentOtpCode = async (email: string) => {
    setTimeLeft(60);
    if (!token) {
      openNotification({
        api: api,
        type: "error",
        title: "Error",
        message: "No se pudo enviar el código OTP. Por favor, inténtalo de nuevo más tarde."
      });
      return;
    }
    const isSendedOtp = await sendOtp(email, token);
    if (isSendedOtp.code !== 200) {
      openNotification({
        api: api,
        type: "error",
        title: "Error",
        message: "No se pudo enviar el código OTP. Por favor, inténtalo de nuevo más tarde."
      });
      return;
    }
    setIsCodeSent(true);
    openNotification({
      api: api,
      type: "success",
      title: "¡Revisa tu correo!",
      message: "Te hemos enviado un código de acceso único. Ingrésalo para continuar."
    });
  };

  const onSubmitHandler = async ({ email, password, otp }: IAuthLogin) => {
    setIsLoading(true);

    if (token) {
      if (isCodeSent && otp) {
        setIsLoading(false);
        const isSendedOtp = await validateOtp(email, otp, token);
        if (isSendedOtp.code !== 200) {
          setIsInvalidCode(true);
          openNotification({
            api: api,
            type: "error",
            title: "Error",
            message: "El código OTP ingresado no es válido. Verifica e intenta nuevamente."
          });
        }
        await getAuth(
          email.trim(),
          isSendedOtp.data.password,
          router,
          false,
          openNotification,
          api
        );
        setIsLoading(false);
        reset();
        return;
      }
      setIsLoading(false);
      await handleSentOtpCode(email);
      return;
    }

    await getAuth(email.trim(), password!, router, false, openNotification, api);
    setIsLoading(false);
    reset();
  };
  const handleForgotPassword = () => {
    setResetPassword(true);
  };

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <form className="loginForm" onSubmit={handleSubmit(onSubmitHandler)}>
      {contextHolder}
      <h4 className="loginForm__title">{!token ? "Inicia sesión" : "Ingresar"}</h4>

      <Flex vertical gap={"1.5rem"} className="loginForm__content">
        {!isCodeSent && (
          <div>
            <p className="loginForm__inputTitle">{!token ? "Usuario" : "Correo electrónico"}</p>
            <InputForm
              customStyle={{ with: "100%" }}
              placeholder="Ingresar usuario"
              hiddenTitle
              control={control}
              nameInput="email"
              typeInput="email"
              validationRules={{ required: "Email es obligatorio" }}
            />
          </div>
        )}
        {isCodeSent && (
          <div>
            <p className="loginForm__otpTitle">
              Hemos enviado el código de autenticación al correo{" "}
              <span className="loginForm__otpTitle__bold">{getValues("email")}</span>
            </p>
            <div className="otpInputContainer">
              <Controller
                name="otp"
                control={control}
                rules={{ required: token && isCodeSent ? true : false }}
                render={({ field }) => (
                  <Input.OTP
                    className="inputOtp"
                    size="large"
                    variant={isInvalidCode ? "outlined" : "filled"}
                    inputMode="numeric"
                    length={6}
                    status={isInvalidCode ? "error" : ""}
                    {...field}
                  />
                )}
              />
            </div>
            {isInvalidCode && <p className="loginForm__otpError">Código inválido</p>}
            {timeLeft > 0 ? (
              <p className="loginForm__otpResentCode">Reenviar en {timeLeft}s</p>
            ) : (
              <p
                onClick={() => handleSentOtpCode(getValues("email"))}
                className="loginForm__otpResentCode"
              >
                Reenviar codigo
              </p>
            )}
          </div>
        )}
        {!token && (
          <div>
            <p className="loginForm__inputTitle">Contraseña</p>
            <Controller
              name="password"
              control={control}
              rules={{ required: token ? false : true }}
              render={({ field }) => (
                <Input
                  size="large"
                  type={showPassword ? "text" : "password"}
                  className="inputPassword"
                  placeholder="Contrasena"
                  variant="borderless"
                  required
                  autoComplete="current-password"
                  suffix={
                    <Tooltip title={showPassword ? "Hidden Password" : "Show Password"}>
                      {!showPassword ? (
                        <Eye onClick={() => setShowPassword(true)} className={"iconEyePassword"} />
                      ) : (
                        <EyeClosed
                          onClick={() => setShowPassword(false)}
                          className={"iconEyePassword"}
                        />
                      )}
                    </Tooltip>
                  }
                  {...field}
                />
              )}
            />
          </div>
        )}
        {!token && (
          <p onClick={handleForgotPassword} className="forgotPassword">
            Olvidé mi contraseña
          </p>
        )}
      </Flex>

      <PrincipalButton disabled={!isValid} loading={isLoading} htmlType="submit">
        {isLoading ? "Cargando..." : "Iniciar sesión"}
      </PrincipalButton>
    </form>
  );
};
