import React from "react";
import { DatePicker, Flex } from "antd";
import dayjs from "dayjs";
import { Calendar } from "phosphor-react";

import "./inputDateFormStyle.scss";

interface InputDateProps {
  titleInput: string;
  value?: dayjs.Dayjs;
  onChange?: (date: dayjs.Dayjs | null) => void;
  hiddenTitle?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  customStyleContainer?: React.CSSProperties;
  hiddenIcon?: boolean;
  minDate?: dayjs.Dayjs;
}

export const InputDate = ({
  titleInput,
  value,
  onChange,
  hiddenTitle = false,
  placeholder = "",
  disabled,
  className,
  customStyleContainer,
  hiddenIcon,
  minDate
}: InputDateProps) => {
  return (
    <Flex vertical className={`datePickerContainer ${className}`} style={customStyleContainer}>
      {!hiddenTitle && <p className="input-date-custom-title">{titleInput}</p>}
      <DatePicker
        value={value}
        onChange={onChange}
        size="large"
        disabled={disabled}
        placeholder={placeholder || `Select ${titleInput.toLowerCase()}`}
        suffixIcon={
          !hiddenIcon ? <Calendar weight="light" className="dateInputForm__icon" /> : false
        }
        className="dateInputForm"
        minDate={minDate}
      />
    </Flex>
  );
};
