import { Flex, Select, SelectProps, Tag, Typography } from "antd";
import {
  ControllerRenderProps,
  FieldErrorsImpl,
  FieldValues,
  Merge,
  FieldError as OriginalFieldError
} from "react-hook-form";
import { X } from "phosphor-react";
import { ReactNode, useEffect, useState } from "react";

import "./general-search-select.scss";

type TagRender = SelectProps["tagRender"];

type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number; label: string }>>;

interface PropsGeneralSelect<T extends FieldValues> {
  errors?: ExtendedFieldError;
  field: ControllerRenderProps<T, any>;
  title?: string;
  placeholder: string;
  options?: { value: number | string; label: string }[] | string[];
  loading?: boolean;
  customStyleContainer?: React.CSSProperties;
  disabled?: boolean;
  suffixIcon?: ReactNode;
  showLabelAndValue?: boolean;
  showValueInTag?: boolean;
}

const GeneralSearchSelect = <T extends FieldValues>({
  errors,
  field,
  title,
  placeholder,
  options,
  loading = false,
  customStyleContainer,
  disabled = false,
  suffixIcon,
  showLabelAndValue,
  showValueInTag
}: PropsGeneralSelect<T>) => {
  const [usedOptions, setUsedOptions] = useState<
    {
      value: number | string;
      label: string;
    }[]
  >();

  useEffect(() => {
    if (!options) setUsedOptions(undefined);
    if (Array.isArray(options)) {
      const formattedOptions = options?.map((option) => {
        if (typeof option === "string") {
          return {
            value: option,
            label: option
          };
        }
        return {
          value: option.value,
          label: option.label
        };
      });

      setUsedOptions(formattedOptions);
    }
  }, [options]);

  const tagRender: TagRender = (props) => {
    const { label, value, onClose, closable } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const displayContent = showValueInTag ? (value as string) : label;
    return (
      <Tag
        className="customTag"
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        closeIcon={
          <button className="customTag__closebtn" onClick={onClose}>
            <X size={12} />
          </button>
        }
      >
        {displayContent}
      </Tag>
    );
  };

  return (
    <Flex vertical className="selectTitleAndError" style={customStyleContainer}>
      {title && <h4 className="inputTitle">{title}</h4>}
      <Select
        {...field}
        mode="tags"
        suffixIcon={suffixIcon}
        tagRender={tagRender}
        maxTagCount={"responsive"}
        optionFilterProp="label"
        placeholder={placeholder}
        className={errors ? "selectSearchCustomError" : "selectSearchCustom"}
        loading={loading}
        variant="borderless"
        optionLabelProp="label"
        popupClassName="selectSearchCustomDrop"
        options={usedOptions}
        labelInValue
        disabled={disabled}
        optionRender={
          showLabelAndValue
            ? (option) => {
                return (
                  <div className="option">
                    <p className="label">{option.label}</p>
                    <p className="value">{option.value}</p>
                  </div>
                );
              }
            : (option) => {
                return (
                  <div className="option">
                    <p className="label">{option.label}</p>
                  </div>
                );
              }
        }
      />
      {errors && <Typography.Text className="textError">{title} es obligatorio *</Typography.Text>}
    </Flex>
  );
};

export default GeneralSearchSelect;
