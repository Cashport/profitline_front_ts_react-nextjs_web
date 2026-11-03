import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { Flex } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations } from "use-intl";

import styles from "./restartPassword.module.scss";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { sendEmailResetPassword } from "@/services/users/users";

interface IAuthLogin {
  email: string;
}

const schema = yup.object().shape({
  email: yup.string().email().required()
});

interface RestartFormProps {
  setResetPassword: Dispatch<SetStateAction<boolean>>;
}
export const RestartPassword = ({ setResetPassword }: RestartFormProps) => {
  const t = useTranslations("auth.resetPassword");
  const tLogin = useTranslations("auth.login");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>();
  const {
    control,
    handleSubmit,

    formState: { isValid }
  } = useForm<IAuthLogin>({
    resolver: yupResolver(schema)
  });

  const onSubmitHandler = async ({ email }: IAuthLogin) => {
    setIsLoading(true);
    try {
      await sendEmailResetPassword(email);
      setEmail(email);
    } catch (error) {
      console.error("error sending reset password email: ", error);
    }
    setIsLoading(false);
  };

  const handleUnderstood = () => {
    setResetPassword(false);
  };

  return (
    <div className={styles.restartContainer}>
      {email ? (
        <p className={styles.sentText}>
          {t.rich("emailSent", { email, b: (chunks) => <strong>{chunks}</strong> })}
        </p>
      ) : (
        <>
          <h4 className={styles.restartContainer__title}>{t("title")}</h4>
          <p>{t("text")}</p>

          <Flex vertical gap={"1.5rem"} className={styles.restartContent}>
            <div>
              <p className={styles.restartContainer__inputTitle}>{tCommon("fields.email")}</p>
              <InputForm
                customStyle={{ with: "100%" }}
                placeholder={tLogin("userPlaceholder")}
                hiddenTitle
                control={control}
                nameInput="email"
                typeInput="email"
                validationRules={{ required: tLogin("emailRequired") }}
              />
            </div>
            <p className={styles.forgotPassword} onClick={() => setResetPassword(false)}>
              {t("backToLogin")}
            </p>
          </Flex>
        </>
      )}

      <PrincipalButton
        disabled={!isValid}
        loading={isLoading}
        onClick={email ? handleUnderstood : handleSubmit(onSubmitHandler)}
      >
        {email ? t("understood") : tCommon("actions.send")}
      </PrincipalButton>
    </div>
  );
};
