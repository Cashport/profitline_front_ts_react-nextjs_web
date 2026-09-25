import React from "react";
import { Result, Button } from "antd";
import "./errorMobile.scss";

interface ErrorMobileProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorMobile: React.FC<ErrorMobileProps> = ({ message, onRetry }) => {
  return (
    <div className="errorMobile">
      <Result
        status="error"
        title="Algo salió mal"
        subTitle={message || "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo."}
        extra={
          onRetry && (
            <Button type="primary" onClick={onRetry} className="errorMobile__button">
              Reintentar
            </Button>
          )
        }
      />
    </div>
  );
};

export default ErrorMobile;
