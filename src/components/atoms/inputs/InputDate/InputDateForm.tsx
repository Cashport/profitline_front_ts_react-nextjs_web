import React from "react";
import { useTranslations } from "use-intl";
import { DatePicker, Flex, Typography } from "antd";
import dayjs from "dayjs";
import {
  Control,
  Controller,
  FieldError,
  FieldErrorsImpl,
  Merge,
  RegisterOptions
} from "react-hook-form";
import { Calendar } from "phosphor-react";

import "./inputDateFormStyle.scss";

interface InputDateFormProps {
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
  minDate?: dayjs.Dayjs | undefined;
}

export const InputDateForm = ({
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
  minDate
}: InputDateFormProps) => {
  const tInputs = useTranslations("components.inputs");
  return (
    <Flex vertical className={`datePickerContainer ${className}`} style={customStyleContainer}>
      {!hiddenTitle && <p className="input-date-custom-title">{titleInput}</p>}
      <Controller
        name={nameInput}
        rules={{ required: true, ...validationRules }}
        control={control}
        render={({ field }) => (
          <DatePicker
            {...field}
            onChange={(date) => field.onChange(date)}
            value={field.value}
            size="large"
            disabled={disabled}
            placeholder={
              placeholder || tInputs("selectPlaceholder", { field: titleInput.toLowerCase() })
            }
            suffixIcon={
              !hiddenIcon ? <Calendar weight="light" className="dateInputForm__icon" /> : false
            }
            className={!error ? "dateInputForm" : "dateInputFormError"}
            minDate={minDate}
          />
        )}
      />
      {error && (
        <Typography.Text className="textError">
          {error.message || tInputs("requiredField", { field: titleInput })}
        </Typography.Text>
      )}
    </Flex>
  );
};
