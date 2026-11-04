import { Flex, Input, Typography } from "antd";
import { useTranslations } from "use-intl";
import { Control, Controller, FieldError, RegisterOptions } from "react-hook-form";
import "./inputFormMoney.scss";
import { useAppStore } from "@/lib/store/store";

interface Props {
  titleInput?: string;
  nameInput: string;
  control: Control<any> | undefined;
  error: FieldError | undefined;
  typeInput?: string;
  customStyle?: any;
  hiddenTitle?: boolean;
  placeholder?: string;
  disabled?: boolean;
  validationRules?: RegisterOptions;
  className?: string;
  readOnly?: boolean;
  defaultValue?: any;
  // eslint-disable-next-line no-unused-vars
  changeInterceptor?: (value: any) => void;
}

export const InputFormMoney = ({
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
  const tInputs = useTranslations("components.inputs");
  const formatMoney = useAppStore((state) => state.formatMoney);

  const parseNumber = (value: string): string => {
    if (value.endsWith(",")) {
      return value.replace(/\./g, "");
    }
    return value.replace(/\./g, "").replace(/,/g, ".");
  };

  return (
    <Flex vertical className={`containerInput__format ${className}`} style={customStyle}>
      {!hiddenTitle && (
        <Typography.Title className="input-form-title" level={5}>
          {titleInput}
        </Typography.Title>
      )}
      <Controller
        name={nameInput}
        rules={{ required: true, ...validationRules }}
        control={control}
        disabled={disabled}
        defaultValue={defaultValue}
        render={({ field: { onChange, value, ...field } }) => (
          <Input
            readOnly={readOnly}
            className={!error ? `inputForm ${readOnly ? "-readOnly" : ""}` : "inputFormError"}
            placeholder={placeholder?.length > 0 ? placeholder : titleInput}
            value={
              typeof value === "string" && (value === "-" || value.endsWith(","))
                ? value
                : value === "" || value === null || value === undefined
                  ? ""
                  : value === "0" || value === 0
                    ? value // Keep 0 if explicitly entered, but allow deletion
                    : formatMoney(value, { hideCurrencySymbol: true })
            }
            onChange={(e) => {
              const rawValue = parseNumber(e.target.value);
              if (rawValue === "-" || rawValue === "-." || rawValue.endsWith(",")) {
                onChange(rawValue);
                return;
              }
              const formattedValue = formatMoney(rawValue, { hideCurrencySymbol: true });

              const numericValue = parseNumber(formattedValue);
              onChange(numericValue);
              changeInterceptor?.(numericValue);
            }}
            {...field}
          />
        )}
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
