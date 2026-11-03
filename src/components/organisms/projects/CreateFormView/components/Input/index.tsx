import { Flex, Input, Typography } from "antd";
import { Control, Controller, FieldError, RegisterOptions } from "react-hook-form";
import { useTranslations } from "use-intl";
import "./input.scss";

interface Props {
  titleInput?: string;
  nameInput: string;
  control: Control<any> | undefined;
  error?: FieldError;
  typeInput?: string;
  customStyle?: any;
  hiddenTitle?: boolean;
  placeholder?: string;
  disabled?: boolean;
  validationRules?: RegisterOptions;
  className?: string;
  readOnly?: boolean;
  // eslint-disable-next-line no-unused-vars
  changeInterceptor?: (value: any) => void;
  // eslint-disable-next-line no-unused-vars
  oninputInterceptor?: (e: any) => void;
  suffix?: React.ReactNode;
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
  changeInterceptor,
  oninputInterceptor,
  suffix
}: Props) => {
  const t = useTranslations("projects.forms");
  return (
    <Flex vertical className={`containerInput ${className}`} style={customStyle}>
      {!hiddenTitle && (
        <Typography.Title className="input-form-title" level={5}>
          {titleInput}
        </Typography.Title>
      )}
      <Controller
        name={nameInput}
        rules={{ required: true, maxLength: 123, ...validationRules }}
        control={control}
        disabled={disabled}
        render={({ field: { onChange, ...field } }) => (
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
            onInput={(e) => {
              oninputInterceptor?.(e);
            }}
            suffix={suffix}
            {...field}
          />
        )}
      />
      <Typography.Text className="textError">
        {error
          ? error.message
            ? ` ${error.message}`
            : t("fieldRequired", { field: titleInput ?? "" })
          : ""}
      </Typography.Text>
    </Flex>
  );
};
