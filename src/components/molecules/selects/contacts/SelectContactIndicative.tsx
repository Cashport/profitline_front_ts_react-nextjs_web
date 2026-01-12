import { useEffect } from "react";
import { Select, Typography } from "antd";
import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import {
  FieldError as OriginalFieldError,
  ControllerRenderProps,
  FieldErrorsImpl,
  Merge,
  FieldValues
} from "react-hook-form";

import { IResponseContactOptions } from "@/types/contacts/IContacts";

import "./commonInputStyles.scss";

type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number; label: string }>>;

interface Props<T extends FieldValues> {
  errors: ExtendedFieldError | undefined;
  field: ControllerRenderProps<T, any>;
  readOnly?: boolean;
  className?: string;
  isColombia?: boolean;
  options: {
    value: number;
    label: string;
  }[];
  isLoading: boolean;
  defaultValue?: {
    value: number;
    label: string;
  };
}

export const SelectContactIndicative = <T extends FieldValues>({
  errors,
  field,
  readOnly,
  className,
  isColombia = false,
  options,
  defaultValue,
  isLoading
}: Props<T>) => {
  useEffect(() => {
    if (isColombia && options.length > 0 && !field.value) {
      const colombiaOption = options.find((option) => option.value === 1);
      if (colombiaOption) {
        field.onChange(colombiaOption);
      }
    }
  }, [isColombia, options, field]);

  return (
    <>
      <Select
        placeholder="Seleccione indicativo"
        className={
          errors ? "selectInputError" : `selectInputCustom ${readOnly && "--readOnly"} ${className}`
        }
        loading={isLoading}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        popupClassName="selectDrop"
        options={options}
        labelInValue
        open={readOnly ? false : undefined}
        popupMatchSelectWidth={false}
        defaultValue={defaultValue}
      />
      {errors && <Typography.Text className="textError">Obligatorio *</Typography.Text>}
    </>
  );
};
