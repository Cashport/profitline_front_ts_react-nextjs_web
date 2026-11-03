"use client";
import { useTranslations } from "use-intl";

const AccountsProjectPage = () => {
  const t = useTranslations("projects.accounts");
  return <h2>{t("placeholder")}</h2>;
};

export default AccountsProjectPage;
