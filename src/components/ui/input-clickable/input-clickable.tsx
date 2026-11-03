import { Input } from "antd";
import { CaretRight } from "phosphor-react";
import { FieldError } from "react-hook-form";
import "./input-clickable.scss";
import React, { useEffect, useState } from "react";
import { useTranslations } from "use-intl";

interface PropsInputClickable {
  title?: string;
  error?: FieldError | undefined | boolean;
  disabled?: boolean;
  value?: string;
  callBackFunction: () => void;
  customStyles?: React.CSSProperties;
}

const InputClickable = ({
  title,
  error,
  disabled,
  callBackFunction,
  value,
  customStyles
}: PropsInputClickable) => {
  const t = useTranslations("components.inputClickable");
  const [className, setClassName] = useState("clickableInput");

  useEffect(() => {
    if (error) {
      setClassName((prev) => `${prev} -error`);
    } else {
      setClassName(className.replace(" -error", ""));
    }

    if (disabled) {
      setClassName((prev) => `${prev} -disabled`);
    } else {
      setClassName(className.replace(" -disabled", ""));
    }
  }, [error, disabled]);

  const handleOnClick = () => {
    if (!disabled) callBackFunction();
  };

  return (
    <div className="inputClickableContainer" style={customStyles}>
      <p className="title">{title}</p>
      <Input
        readOnly
        addonAfter={<CaretRight size={"16px"} />}
        variant="borderless"
        className={className}
        placeholder={t("frequencyPlaceholder")}
        onClick={handleOnClick}
        data-tool-tip="TEST"
        value={value}
      />
    </div>
  );
};

export default InputClickable;
