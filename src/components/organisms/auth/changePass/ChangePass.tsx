"use client";
import { Flex } from "antd";

import { InfoCardLogin } from "@/components/molecules/login/InfoCardLogin/InfoCardLogin";
import { ChangePassForm } from "@/components/molecules/login/ChangePassForm/ChangePassForm";
import { ContactUsButton } from "@/components/atoms/buttons/contactUsButton/ContactUsButton";

import styles from "./changePass.module.scss";
import { LogoCashport } from "@/components/atoms/logoCashport/LogoCashport";

export const ChangePass = ({ mode }: { mode: "accept" | "reset" }) => {
  return (
    <main className={styles.container}>
      <InfoCardLogin />
      <Flex className={styles.changeSection} align="center" justify="center" vertical>
        <Flex className={styles.changePass} vertical align="center" justify="space-between">
          <div className={styles.changePass__title}>
            <LogoCashport width={370} />
          </div>

          <ChangePassForm mode={mode} />
          <ContactUsButton />
        </Flex>
      </Flex>
    </main>
  );
};
