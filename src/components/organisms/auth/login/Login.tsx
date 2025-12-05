import { FC, useState } from "react";
import { Flex } from "antd";
import { LogoCashport } from "@/components/atoms/logoCashport/LogoCashport";
import { LoginForm } from "../../forms/LoginForm/LoginForm";
import { InfoCardLogin } from "@/components/molecules/login/InfoCardLogin/InfoCardLogin";
import { RestartPassword } from "@/components/molecules/login/RestarPassword/RestartPassword";
import { ContactUsButton } from "@/components/atoms/buttons/contactUsButton/ContactUsButton";
import useScreenWidth from "@/components/hooks/useScreenWidth";

import styles from "./login.module.scss";

interface ILoginView {
  token: string | null;
}

export const LoginView: FC<ILoginView> = ({ token }) => {
  const [resetPassword, setResetPassword] = useState(false);
  const width = useScreenWidth();
  return (
    <main className={styles.container}>
      <InfoCardLogin />
      <Flex className={styles.loginSection} align="center" justify="center" vertical>
        <Flex className={styles.login} vertical align="center" justify="space-between">
          <div className={styles.login__title}>
            <LogoCashport width={width > 400 ? 370 : width} />
          </div>
          {!resetPassword ? (
            <LoginForm setResetPassword={setResetPassword} token={token || null} />
          ) : (
            <RestartPassword setResetPassword={setResetPassword} />
          )}
          <ContactUsButton />
        </Flex>
      </Flex>
    </main>
  );
};
