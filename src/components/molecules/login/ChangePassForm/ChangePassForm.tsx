import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { Flex, Input, notification, Tooltip } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

import { Eye, EyeClosed } from "phosphor-react";

import "./changePassForm.scss";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "../../../../../firebase-utils";
import { openNotification } from "@/components/atoms/Notification/Notification";
import { createPassword } from "@/services/users/users";
import { ApiError } from "@/utils/api/api";

interface IChangePassForm {
  password: string;
  confirmPassword: string;
}

const schema = yup.object().shape({
  password: yup.string().min(5).max(32).required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required()
});

export const ChangePassForm = ({ mode }: { mode: "accept" | "reset" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get(mode === "accept" ? "token" : "oobCode");
  const copyText =
    mode === "accept"
      ? {
          title: "Crea una nueva contraseña",
          text: "Ingresa tu nueva contraseña"
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
      await resetPassword(token, password);
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
      openNotification({
        api: api,
        type: "error",
        title: "Error",
        message: "Hubo un error al restablecer la contraseña, pruebe mandar otro correo"
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
  const onSubmitHandler = mode === "accept" ? onSubmitHandlerCreatePass : onSubmitResetHandler;
  if (!token) return;
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
              <Input
                size="large"
                type={showPassword.password ? "text" : "password"}
                className="inputPassword"
                placeholder="Contrasena"
                variant="borderless"
                required
                autoComplete="current-password"
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
        Restablecer contraseña
      </PrincipalButton>
    </form>
  );
};
