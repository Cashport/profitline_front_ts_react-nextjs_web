import React from "react";
import { TimePicker, Flex, Typography } from "antd";
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
  format = "HH:mm:ss"
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
