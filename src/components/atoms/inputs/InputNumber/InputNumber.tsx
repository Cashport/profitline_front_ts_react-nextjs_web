import { Flex, Input, Typography } from "antd";
import { Control, Controller, FieldError, RegisterOptions } from "react-hook-form";

import "./inputnumber.scss";

interface Props {
  titleInput?: string;
  nameInput: string;
  control: Control<any> | undefined;
  error?: FieldError | undefined;
  customStyle?: any;
  hiddenTitle?: boolean;
  placeholder?: string;
  disabled?: boolean;
  validationRules?: RegisterOptions;
  className?: string;
  readOnly?: boolean;
  defaultValue?: number;
  changeInterceptor?: (value: any) => void;
}

export const InputNumber = ({
  titleInput,
  nameInput,
  control,
  error,
  customStyle = {},
  hiddenTitle = false,
  placeholder = "",
  disabled,
  validationRules,
  className,
  readOnly,
  defaultValue,
  changeInterceptor
}: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: number | null) => void) => {
    const value = e.target.value;
    // Only allow digits and empty string
    if (value === "" || /^\d*$/.test(value)) {
      const numValue = value === "" ? null : parseInt(value, 10);
      onChange(numValue);
      changeInterceptor?.(numValue);
    }
  };

  return (
    <Flex vertical className={`containerInput ${className}`} style={customStyle}>
      {!hiddenTitle && (
        <Typography.Title className="input-form-title" level={5}>
          {titleInput}
        </Typography.Title>
      )}
      <Controller
        name={nameInput}
        control={control}
        rules={validationRules}
        defaultValue={defaultValue}
        render={({ field: { onChange, value, ...field } }) => (
          <Input
            {...field}
            value={value ?? ""}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => handleChange(e, onChange)}
            className={error ? "error" : ""}
          />
        )}
      />
      {error && (
        <Typography.Text type="danger" className="error-message">
          {error.message}
        </Typography.Text>
      )}
    </Flex>
  );
};
