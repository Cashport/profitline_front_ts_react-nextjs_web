import React from "react";
import { TimePicker, Flex, Typography, TimePickerProps } from "antd";
import dayjs from "dayjs";
import {
  Control,
  Controller,
  FieldError,
  FieldErrorsImpl,
  Merge,
  RegisterOptions
} from "react-hook-form";
import { Clock } from "phosphor-react";

import "./inputTimeFormStyle.scss";

interface InputTimeFormProps {
  titleInput: string;
  nameInput: string;
  control: Control<any> | undefined;
  error:
    | Merge<FieldError, FieldErrorsImpl<NonNullable<Date | dayjs.Dayjs>>>
    | undefined
    | FieldError;
  hiddenTitle?: boolean;
  placeholder?: string;
  disabled?: boolean;
  validationRules?: RegisterOptions;
  className?: string;
  customStyleContainer?: React.CSSProperties;
  hiddenIcon?: boolean;
  format?: string;
  minuteStep?: TimePickerProps["minuteStep"];
}

export const InputTimeForm = ({
  titleInput,
  nameInput,
  control,
  error,
  hiddenTitle = false,
  placeholder = "",
  disabled,
  validationRules,
  className,
  customStyleContainer,
  hiddenIcon,
  format = "HH:mm:ss",
  minuteStep
}: InputTimeFormProps) => {
  return (
    <Flex vertical className={`timePickerContainer ${className}`} style={customStyleContainer}>
      {!hiddenTitle && <p className="input-time-custom-title">{titleInput}</p>}
      <Controller
        name={nameInput}
        rules={{ required: true, ...validationRules }}
        control={control}
        render={({ field }) => (
          <TimePicker
            {...field}
            onChange={(time) => field.onChange(time)}
            value={field.value}
            size="large"
            disabled={disabled}
            placeholder={placeholder || `Select ${titleInput.toLowerCase()}`}
            suffixIcon={
              !hiddenIcon ? <Clock weight="light" className="timeInputForm__icon" /> : false
            }
            className={!error ? "timeInputForm" : "timeInputFormError"}
            format={format}
            minuteStep={minuteStep}
          />
        )}
      />
      {error && (
        <Typography.Text className="textError">
          {error.message || `${titleInput} es obligatorio *`}
        </Typography.Text>
      )}
    </Flex>
  );
};
