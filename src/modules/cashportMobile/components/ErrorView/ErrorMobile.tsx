import React from "react";
import { Result, Button } from "antd";
import { useTranslations } from "use-intl";
import "./errorMobile.scss";

interface ErrorMobileProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorMobile: React.FC<ErrorMobileProps> = ({ message, onRetry }) => {
  const t = useTranslations("publicPortals.mobile.error");
  const tCommon = useTranslations("common");
  return (
    <div className="errorMobile">
      <Result
        status="error"
        title={t("title")}
        subTitle={message || t("unexpected")}
        extra={
          onRetry && (
            <Button type="primary" onClick={onRetry} className="errorMobile__button">
              {tCommon("actions.retry")}
            </Button>
          )
        }
      />
    </div>
  );
};

export default ErrorMobile;
