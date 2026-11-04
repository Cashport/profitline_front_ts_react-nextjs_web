import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { Flex, Input, Tooltip, notification } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "phosphor-react";
import { useTranslations } from "use-intl";

import {
  getAuth,
  signInWithPolicyCheck,
  continueLoginAfterAuth
} from "../../../../../firebase-utils";

import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { openNotification } from "@/components/atoms/Notification/Notification";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import "./loginform.scss";
import { sendOtp, validateOtp } from "@/services/externalAuth/externalAuth";
import { sendLoginOtp, verifyLoginOtp } from "@/services/auth/authPolicy";

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
    .when(["$hasToken", "$isCodeSent"], {
      is: (hasToken: boolean, isCodeSent: boolean) => hasToken || isCodeSent,
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
  // Fired when the periodic-password-expiration policy requires a new
  // password before login can complete. The email pre-fills the change
  // password screen the parent (Login.tsx) swaps in.
  // eslint-disable-next-line no-unused-vars
  onExpiredPassword?: (email: string) => void;
  // Set when the parent already completed sign-in and a password change
  // (both handled outside this component) and OTP is still pending: skips
  // straight to the code-entry screen instead of asking for credentials
  // again, since the Firebase session is already valid.
  initialOtpEmail?: string;
}
export const LoginForm = ({
  setResetPassword,
  token,
  onExpiredPassword,
  initialOtpEmail
}: LoginFormProps) => {
  const t = useTranslations("auth.login");
  const tPassword = useTranslations("auth.password");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isInvalidCode, setIsInvalidCode] = useState(false);
  const [isOtpSentModalOpen, setIsOtpSentModalOpen] = useState(false);
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

  // Marketplace/Cetaphil OTP flow (?token= external link) - unchanged.
  const handleSendMarketplaceOtp = async (email: string) => {
    setTimeLeft(60);
    if (!token) return;
    try {
      const isSendedOtp = await sendOtp(email, token);
      if (isSendedOtp.code !== 200) {
        throw new Error(isSendedOtp.message);
      }
      setIsOtpSentModalOpen(true);
    } catch (error) {
      openNotification({
        api: api,
        type: "error",
        title: t("errorTitle"),
        message: t("otpSendError")
      });
    }
  };

  // Periodic-OTP flow for the plain email+password login, triggered once
  // signInWithPolicyCheck reports the policy requires it.
  const handleSendLoginOtp = async () => {
    setTimeLeft(60);
    const result = await sendLoginOtp();
    if (result.status !== 200) {
      openNotification({
        api: api,
        type: "error",
        title: t("errorTitle"),
        // El backend distingue entre cooldown de reenvío, bloqueo por intentos
        // fallidos y fallo de envío; se muestra su mensaje cuando lo trae.
        message: result.message || t("otpSendError")
      });
      return;
    }
    setIsOtpSentModalOpen(true);
  };

  const handleConfirmOtpSent = () => {
    setIsOtpSentModalOpen(false);
    setIsCodeSent(true);
  };

  const handleSentOtpCode = async (email: string) => {
    if (token) {
      await handleSendMarketplaceOtp(email);
    } else {
      await handleSendLoginOtp();
    }
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
            title: t("errorTitle"),
            message: t("otpInvalid")
          });
          return;
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
      await handleSentOtpCode(email);
      setIsLoading(false);
      return;
    }

    if (isCodeSent && otp) {
      const result = await verifyLoginOtp(otp);
      if (result.status !== 200) {
        setIsLoading(false);
        setIsInvalidCode(true);
        openNotification({
          api: api,
          type: "error",
          title: t("errorTitle"),
          message: result.message || t("otpInvalidOrExpired")
        });
        return;
      }
      const outcome = await continueLoginAfterAuth(router);
      setIsLoading(false);
      if (outcome.step === "expiredPassword") {
        onExpiredPassword?.(outcome.email);
      }
      reset();
      return;
    }

    const outcome = await signInWithPolicyCheck(
      email.trim(),
      password!,
      router,
      openNotification,
      api
    );
    if (outcome.step === "otp") {
      await handleSendLoginOtp();
    } else if (outcome.step === "expiredPassword") {
      onExpiredPassword?.(outcome.email);
    }
    setIsLoading(false);
    reset({ email });
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

  useEffect(() => {
    if (!initialOtpEmail) return;
    reset({ email: initialOtpEmail });
    handleSendLoginOtp();
    // Runs once on mount only - initialOtpEmail is set by the parent when
    // it mounts this step, not meant to re-trigger on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form className="loginForm" onSubmit={handleSubmit(onSubmitHandler)}>
      {contextHolder}
      <ModalConfirmAction
        isOpen={isOtpSentModalOpen}
        onClose={handleConfirmOtpSent}
        title={t("otpSentModal.title")}
        content={<p>{t("otpSentModal.content")}</p>}
        cancelText={t("otpSentModal.ok")}
        hideOkButton
      />
      <h4 className="loginForm__title">{!token ? t("title") : t("titleExternal")}</h4>

      <Flex vertical gap={"1.5rem"} className="loginForm__content">
        {!isCodeSent && (
          <div>
            <p className="loginForm__inputTitle">
              {!token ? t("userLabel") : tCommon("fields.email")}
            </p>
            <InputForm
              customStyle={{ with: "100%" }}
              placeholder={t("userPlaceholder")}
              hiddenTitle
              control={control}
              nameInput="email"
              typeInput="email"
              validationRules={{ required: t("emailRequired") }}
            />
          </div>
        )}
        {isCodeSent && (
          <div>
            <p className="loginForm__otpTitle">
              {t.rich("otpSentTo", {
                email: getValues("email"),
                b: (chunks) => <span className="loginForm__otpTitle__bold">{chunks}</span>
              })}
            </p>
            <div className="otpInputContainer">
              <Controller
                name="otp"
                control={control}
                rules={{ required: isCodeSent }}
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
            {isInvalidCode && <p className="loginForm__otpError">{t("otpInvalidShort")}</p>}
            {timeLeft > 0 ? (
              <p className="loginForm__otpResentCode">{t("resendIn", { seconds: timeLeft })}</p>
            ) : (
              <p
                onClick={() => handleSentOtpCode(getValues("email"))}
                className="loginForm__otpResentCode"
              >
                {t("resendCode")}
              </p>
            )}
          </div>
        )}
        {!token && !isCodeSent && (
          <div>
            <p className="loginForm__inputTitle">{tPassword("label")}</p>
            <Controller
              name="password"
              control={control}
              rules={{ required: token ? false : true }}
              render={({ field }) => (
                <Input
                  size="large"
                  type={showPassword ? "text" : "password"}
                  className="inputPassword"
                  placeholder={tPassword("placeholder")}
                  variant="borderless"
                  required
                  autoComplete="current-password"
                  suffix={
                    <Tooltip title={showPassword ? tPassword("hide") : tPassword("show")}>
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
        {!token && !isCodeSent && (
          <p onClick={handleForgotPassword} className="forgotPassword">
            {t("forgotPassword")}
          </p>
        )}
      </Flex>

      <PrincipalButton disabled={!isValid} loading={isLoading} htmlType="submit">
        {isLoading ? tCommon("status.loading") : t("submit")}
      </PrincipalButton>
    </form>
  );
};
