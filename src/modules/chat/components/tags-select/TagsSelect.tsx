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

import "./tagsSelect.scss";

type TagRender = SelectProps["tagRender"];

type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number; label: string }>>;

interface PropsTagsSelect<T extends FieldValues> {
  errors?: ExtendedFieldError;
  field: ControllerRenderProps<T, any>;
  title?: string;
  placeholder: string;
  options?: ({ value: number | string; label: string; [key: string]: any } | string)[];
  loading?: boolean;
  disabled?: boolean;
  suffixIcon?: ReactNode;
  showLabelAndValue?: boolean;
  showValueInTag?: boolean;
  optionKeyField?: string;
}

const TagsSelect = <T extends FieldValues>({
  errors,
  field,
  title,
  placeholder,
  options,
  loading = false,
  disabled = false,
  suffixIcon,
  showLabelAndValue,
  showValueInTag,
  optionKeyField
}: PropsTagsSelect<T>) => {
  const [usedOptions, setUsedOptions] = useState<
    { value: number | string; label: string; [key: string]: any }[]
  >();

  useEffect(() => {
    if (!options) setUsedOptions(undefined);
    if (Array.isArray(options)) {
      const formattedOptions = options.map((option) => {
        if (typeof option === "string") {
          return { value: option, label: option };
        }
        return { ...option };
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
    let displayContent;
    if (showValueInTag && optionKeyField) {
      const originalOption = usedOptions?.find((opt) => String(opt[optionKeyField]) === String(value));
      displayContent = originalOption?.value ?? value;
    } else {
      displayContent = showValueInTag ? (value as string) : label;
    }
    return (
      <Tag
        className="tagsSelect__tag"
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        closeIcon={
          <button className="tagsSelect__tag__closebtn" onClick={onClose}>
            <X size={12} />
          </button>
        }
      >
        {displayContent}
      </Tag>
    );
  };

  return (
    <Flex vertical className="tagsSelectContainer">
      {title && <h4 className="tagsSelectContainer__title">{title}</h4>}
      <Select
        {...field}
        mode="tags"
        suffixIcon={suffixIcon}
        tagRender={tagRender}
        optionFilterProp="label"
        placeholder={placeholder}
        className={errors ? "tagsSelectContainer__selectError" : "tagsSelectContainer__select"}
        loading={loading}
        variant="borderless"
        optionLabelProp="label"
        popupClassName="tagsSelectDrop"
        options={optionKeyField ? undefined : usedOptions}
        labelInValue
        disabled={disabled}
        optionRender={
          optionKeyField
            ? undefined
            : showLabelAndValue
              ? (option) => (
                  <div className="tagsSelectDrop__option">
                    <p className="tagsSelectDrop__option__label">{option.label}</p>
                    <p className="tagsSelectDrop__option__value">{option.value}</p>
                  </div>
                )
              : (option) => (
                  <div className="tagsSelectDrop__option">
                    <p className="tagsSelectDrop__option__label">{option.label}</p>
                  </div>
                )
        }
      >
        {optionKeyField &&
          usedOptions?.map((opt) => (
            <Select.Option key={opt[optionKeyField]} value={String(opt[optionKeyField])} label={opt.label}>
              {showLabelAndValue ? (
                <div className="tagsSelectDrop__option">
                  <p className="tagsSelectDrop__option__label">{opt.label}</p>
                  <p className="tagsSelectDrop__option__value">{opt.value}</p>
                </div>
              ) : (
                <div className="tagsSelectDrop__option">
                  <p className="tagsSelectDrop__option__label">{opt.label}</p>
                </div>
              )}
            </Select.Option>
          ))}
      </Select>
      {errors && (
        <Typography.Text className="tagsSelectContainer__error">
          {title} es obligatorio *
        </Typography.Text>
      )}
    </Flex>
  );
};

export default TagsSelect;
