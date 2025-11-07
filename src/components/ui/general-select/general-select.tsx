import { Flex, Select, Typography } from "antd";
import "./general-select.scss";
import {
  ControllerRenderProps,
  FieldErrorsImpl,
  FieldValues,
  Merge,
  FieldError as OriginalFieldError
} from "react-hook-form";
import { useEffect, useState } from "react";

type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number | string; label: string }>>;

interface PropsGeneralSelect<T extends FieldValues> {
  errors?: ExtendedFieldError | undefined;
  field: ControllerRenderProps<T, any>;
  title?: string;
  placeholder: string;
  options: { value: number | string; label: string }[] | undefined | string[];
  loading?: boolean;
  customStyleContainer?: React.CSSProperties;
  customStyleTitle?: React.CSSProperties;
  titleAbsolute?: boolean;
  errorSmall?: boolean;
  readOnly?: boolean;
  showSearch?: boolean;
  autoSelectFirst?: boolean;
}

const GeneralSelect = <T extends FieldValues>({
  errors,
  field,
  title,
  placeholder,
  options,
  loading,
  customStyleContainer,
  customStyleTitle,
  titleAbsolute,
  errorSmall,
  readOnly,
  showSearch = false,
  autoSelectFirst = false
}: PropsGeneralSelect<T>) => {
  const [usedOptions, setUsedOptions] = useState<
    {
      value: number | string;
      label: string;
      className: string;
    }[]
  >();

  useEffect(() => {
    if (!options) setUsedOptions(undefined);
    if (Array.isArray(options)) {
      const formattedOptions = options?.map((option) => {
        if (typeof option === "string") {
          return {
            value: option,
            label: option,
            className: "selectOptions"
          };
        } else if (option === null) {
          return {
            value: "",
            label: "",
            className: "selectOptions"
          };
        }
        return {
          value: option.value,
          label: option.label,
          className: "selectOptions"
        };
      });

      setUsedOptions(formattedOptions);
    }
  }, [options]);

  useEffect(() => {
    if (autoSelectFirst && usedOptions && usedOptions.length > 1 && !field.value) {
      const firstRealOption = usedOptions[1];
      field.onChange({ value: firstRealOption.value, label: firstRealOption.label });
    }
  }, [autoSelectFirst, usedOptions, field]);

  return (
    <Flex vertical style={customStyleContainer} className="generalSelectContainer">
      {title && (
        <h4 className={`inputTitle ${titleAbsolute && "-absolute"}`} style={customStyleTitle}>
          {title}
        </h4>
      )}
      <Select
        showSearch={showSearch}
        placeholder={placeholder}
        className={`${errors ? "selectInputError" : "selectInputCustom"} ${readOnly ? "-readOnly" : ""}`}
        loading={loading}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        popupClassName="generalSelectContainer__selectDrop"
        options={usedOptions}
        labelInValue
        disabled={readOnly || field.disabled}
        filterOption={(input, option) =>
          option ? option.label.toLowerCase().includes(input.toLowerCase()) : false
        }
      />
      {errors && (
        <Typography.Text className={`textError ${errorSmall && "-smallFont"}`}>
          {title} es obligatoria *
        </Typography.Text>
      )}
    </Flex>
  );
};

export default GeneralSelect;
