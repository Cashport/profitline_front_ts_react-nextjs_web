import { useMemo, useState } from "react";
import { useTranslations } from "use-intl";
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

// eslint-disable-next-line no-unused-vars
const buildSchema = (t: (key: PasswordRuleKey) => string) =>
  yup.object().shape({
    password: yup
      .string()
      .min(8, t("rules.minLength"))
      .max(32, t("rules.maxLength"))
      .matches(/[a-z]/, t("rules.lowercase"))
      .matches(/[A-Z]/, t("rules.uppercase"))
      .matches(/\d/, t("rules.number"))
      .matches(/[!@#$%^&*(),.?":{}|<>]/, t("rules.special"))
      .required(),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("rules.mismatch"))
      .required()
  });

type PasswordRuleKey =
  | "rules.minLength"
  | "rules.maxLength"
  | "rules.lowercase"
  | "rules.uppercase"
  | "rules.number"
  | "rules.special"
  | "rules.mismatch";

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
  const t = useTranslations("auth.changePassword");
  const tPassword = useTranslations("auth.password");
  const schema = useMemo(() => buildSchema(tPassword), [tPassword]);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const token =
    mode === "expired" ? null : searchParams.get(mode === "accept" ? "token" : "oobCode");
  const copyText =
    mode === "accept"
      ? {
          title: t("accept.title"),
          text: t("accept.text")
        }
      : mode === "expired"
        ? {
            title: t("expired.title"),
            text: t("expired.text")
          }
        : {
            title: t("reset.title"),
            text: t("reset.text")
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
        title: t("reset.successTitle"),
        message: t("reset.successMessage")
      });
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      let message = t("reset.error");
      if (error instanceof ApiError) {
        message = error.message;
      }
      openNotification({
        api: api,
        type: "error",
        title: t("errorTitle"),
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
        title: t("accept.successTitle"),
        message: t("accept.successMessage")
      });
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      let message = t("accept.error");
      if (error instanceof ApiError) {
        message = error.message;
      }
      openNotification({
        api: api,
        type: "error",
        title: t("errorTitle"),
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
      let message = t("expired.error");
      if (error instanceof ApiError) {
        message = error.message;
      }
      openNotification({
        api: api,
        type: "error",
        title: t("errorTitle"),
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
          <p className="changePassForm__inputTitle">{t("newPassword")}</p>
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
                  placeholder={tPassword("placeholder")}
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
                    <Tooltip title={showPassword.password ? tPassword("hide") : tPassword("show")}>
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
          <p className="changePassForm__inputTitle">{t("confirmPassword")}</p>
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
                  placeholder={tPassword("placeholder")}
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
                      title={showPassword.confirmPassword ? tPassword("hide") : tPassword("show")}
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
        {mode === "expired" ? t("submitUpdate") : t("submitReset")}
      </PrincipalButton>
    </form>
  );
};
