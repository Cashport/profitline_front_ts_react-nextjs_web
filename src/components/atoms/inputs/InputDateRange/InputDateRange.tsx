import { Calendar } from "phosphor-react";
import { useTranslations } from "use-intl";
import React from "react";
import { DatePicker, Flex, Typography } from "antd";
import { Control, Controller, FieldError, RegisterOptions } from "react-hook-form";

import "./inputDateRange.scss";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface InputDateRangeProps {
  titleInput: string;
  nameInput: string;
  control: Control<any> | undefined;
  error: FieldError | undefined;
  hiddenTitle?: boolean;
  placeholderInitial?: string;
  placeholderFinal?: string;
  disabled?: boolean;
  validationRules?: RegisterOptions;
  className?: string;
  isError?: boolean;
  optional?: boolean;
}

export const InputDateRange = ({
  titleInput,
  nameInput,
  control,
  error,
  hiddenTitle = false,
  placeholderInitial = "",
  placeholderFinal = "",
  disabled,
  validationRules,
  className,
  isError = false,
  optional = false
}: InputDateRangeProps) => {
  const tInputs = useTranslations("components.inputs");
  const dateFormat = "YYYY/MM/DD";
  return (
    <Flex vertical className={`datePickerRangeContainer ${className}`}>
      <Flex>
        {!hiddenTitle && <p className="input-date-custom-title">{titleInput}</p>}
        {optional && <p className="input-date-custom-title-option">*{tInputs("optional")}</p>}
      </Flex>
      <Controller
        name={nameInput}
        rules={{ required: true, ...validationRules }}
        control={control}
        render={({ field }) => {
          if (isError) {
            return <Text type="danger">{tInputs("loadOptionsError")}</Text>;
          }
          return (
            <RangePicker
              {...field}
              format={dateFormat}
              placeholder={[
                placeholderInitial ||
                  tInputs("selectPlaceholder", { field: titleInput.toLowerCase() }),
                placeholderFinal
              ]}
              className={error ? "dateInputFormError" : "dateInputForm"}
              disabled={disabled}
              suffixIcon={<Calendar className="dateInputForm__icon" />}
              onChange={(value) => field.onChange(value)}
              value={field.value}
              size="large"
            />
          );
        }}
      />
      {error && <Text className="textError">{error.message || `${titleInput} is required`}</Text>}
    </Flex>
  );
};
