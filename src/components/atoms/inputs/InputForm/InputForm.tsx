import { Flex, Input, Typography } from "antd";
import { useTranslations } from "use-intl";

import { Control, Controller, FieldError, RegisterOptions } from "react-hook-form";

import "./inputform.scss";

const { TextArea } = Input;

interface Props {
  titleInput?: string;
  nameInput: string;
  control: Control<any> | undefined;
  error?: FieldError | undefined;
  typeInput?: string;
  customStyle?: any;
  hiddenTitle?: boolean;
  placeholder?: string;
  disabled?: boolean;
  validationRules?: RegisterOptions;
  className?: string;
  readOnly?: boolean;
  suffix?: React.ReactNode;
  defaultValue?: string;
  isTextArea?: boolean; // Nueva propiedad para manejar TextArea
  rows?: number; // Para definir la cantidad de filas en el TextArea
  // eslint-disable-next-line no-unused-vars
  changeInterceptor?: (value: any) => void;
}

export const InputForm = ({
  titleInput,
  nameInput,
  typeInput = "text",
  control,
  error,
  customStyle = {},
  hiddenTitle = false,
  placeholder = "",
  disabled,
  validationRules,
  className,
  readOnly,
  suffix,
  defaultValue,
  isTextArea = false,
  rows = 4, // Número de filas por defecto para TextArea
  changeInterceptor
}: Props) => {
  const tInputs = useTranslations("components.inputs");
  return (
    <Flex vertical className={`containerInput ${className}`} style={customStyle}>
      {!hiddenTitle && (
        <Typography.Title className="input-form-title" level={5}>
          {titleInput}
        </Typography.Title>
      )}
      <Controller
        defaultValue={defaultValue}
        name={nameInput}
        rules={{ required: true, maxLength: 123, ...validationRules }}
        control={control}
        disabled={disabled}
        render={({ field: { onChange, ...field } }) =>
          isTextArea ? (
            <TextArea
              readOnly={readOnly}
              className={!error ? `textArea ${readOnly && "-readOnly"}` : "inputFormError"}
              placeholder={placeholder?.length > 0 ? placeholder : titleInput}
              onChange={(e) => {
                onChange(e);
                changeInterceptor?.(e.target.value);
              }}
              rows={rows}
              {...field}
            />
          ) : (
            <Input
              readOnly={readOnly}
              type={typeInput}
              className={!error ? `inputForm ${readOnly && "-readOnly"}` : "inputFormError"}
              variant="borderless"
              placeholder={placeholder?.length > 0 ? placeholder : titleInput}
              onChange={(e) => {
                onChange(e);
                changeInterceptor?.(e.target.value);
              }}
              suffix={suffix}
              {...field}
            />
          )
        }
      />
      <Typography.Text className="textError">
        {error
          ? error.message
            ? ` ${error.message}`
            : tInputs("requiredField", { field: titleInput ?? "" })
          : ""}
      </Typography.Text>
    </Flex>
  );
};
