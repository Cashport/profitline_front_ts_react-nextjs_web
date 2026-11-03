import { Button } from "antd";
import { Envelope } from "phosphor-react";
import { useTranslations } from "use-intl";

import "./contactUsButton.scss";

export const ContactUsButton = () => {
  const t = useTranslations("auth.contactUs");
  return (
    <div className="contactUsButton">
      <Button className="contactUsButton__btn">
        {t("label")} <Envelope size={16} />
      </Button>
    </div>
  );
};
