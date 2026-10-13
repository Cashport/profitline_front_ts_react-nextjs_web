import { Dispatch, FC, SetStateAction, useState } from "react";
import { Flex } from "antd";
import { LogoCashport } from "@/components/atoms/logoCashport/LogoCashport";
import { LoginForm } from "../../forms/LoginForm/LoginForm";
import { InfoCardLogin } from "@/components/molecules/login/InfoCardLogin/InfoCardLogin";
import { RestartPassword } from "@/components/molecules/login/RestarPassword/RestartPassword";
import { ChangePassForm } from "@/components/molecules/login/ChangePassForm/ChangePassForm";
import { ContactUsButton } from "@/components/atoms/buttons/contactUsButton/ContactUsButton";
import useScreenWidth from "@/components/hooks/useScreenWidth";

import styles from "./login.module.scss";

interface ILoginView {
  token: string | null;
}

type LoginStep = "login" | "reset" | "expiredPassword";

export const LoginView: FC<ILoginView> = ({ token }) => {
  const width = useScreenWidth();
  const [step, setStep] = useState<LoginStep>("login");
  // Email carried across steps: shown in the "expired password" copy, and
  // handed back to LoginForm so it can skip straight to OTP entry if the
  // same login also requires OTP validation after the password is changed.
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [pendingOtpEmail, setPendingOtpEmail] = useState<string | undefined>(undefined);

  // Typed as Dispatch<SetStateAction<boolean>> to match LoginForm's and
  // RestartPassword's existing prop contract (neither passes it an updater
  // function in practice, but the type must still accept one).
  const setResetPassword: Dispatch<SetStateAction<boolean>> = (value) => {
    const next = typeof value === "function" ? value(step === "reset") : value;
    setStep(next ? "reset" : "login");
  };
  const handleExpiredPassword = (email: string) => {
    setPendingEmail(email);
    setPendingOtpEmail(undefined);
    setStep("expiredPassword");
  };
  const handleRequireOtpAfterPasswordChange = () => {
    setPendingOtpEmail(pendingEmail);
    setStep("login");
  };

  return (
    <main className={styles.container}>
      <InfoCardLogin />
      <Flex className={styles.loginSection} align="center" justify="center" vertical>
        <Flex className={styles.login} vertical align="center" justify="space-between">
          <div className={styles.login__title}>
            <LogoCashport width={width > 400 ? 370 : width} />
          </div>
          {step === "login" && (
            <LoginForm
              setResetPassword={setResetPassword}
              token={token || null}
              onExpiredPassword={handleExpiredPassword}
              initialOtpEmail={pendingOtpEmail}
            />
          )}
          {step === "reset" && <RestartPassword setResetPassword={setResetPassword} />}
          {step === "expiredPassword" && (
            <ChangePassForm
              mode="expired"
              email={pendingEmail}
              onRequireOtp={handleRequireOtpAfterPasswordChange}
            />
          )}
          <ContactUsButton />
        </Flex>
      </Flex>
    </main>
  );
};
