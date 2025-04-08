import { Control, Controller, FieldError, RegisterOptions } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Flex, Input, Typography } from "antd";

import "./inputMoney.scss";

interface InputMoneyProps {
  name: string;
  control: Control<any>;
  titleInput: string;
  placeholder?: string;
  error?: FieldError;
  validationRules?: RegisterOptions;
  customClassName?: string;
  hiddenTitle?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  fixedDecimalScale?: boolean;
  allowNegative?: boolean;
}

const InputMoney = ({
  name,
  control,
  titleInput,
  placeholder = "",
  error,
  validationRules = {},
  customClassName = "",
  hiddenTitle = false,
  readOnly = false,
  disabled = false,
  fixedDecimalScale = false,
  allowNegative = false
}: InputMoneyProps) => {
  return (
    <Flex vertical className={`inputMoney ${customClassName}`}>
      {!hiddenTitle && (
        <Typography.Title className="input-form-title" level={5}>
          {titleInput}
        </Typography.Title>
      )}

      <Controller
        name={name}
        control={control}
        rules={validationRules}
        render={({ field }) => (
          <NumericFormat
            {...field}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale={fixedDecimalScale}
            allowNegative={allowNegative}
            disabled={disabled}
            readOnly={readOnly}
            customInput={Input}
            placeholder={placeholder || titleInput}
            className={
              !error
                ? `inputForm ${readOnly ? "-readOnly" : ""} ${disabled ? "-disabled" : ""}`
                : "inputFormError"
            }
          />
        )}
      />

      <Typography.Text className="textError">
        {error?.message || (error ? `${titleInput} es obligatorio *` : "")}
      </Typography.Text>
    </Flex>
  );
};

export default InputMoney;
