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
}

export const SelectContactIndicative = <T extends FieldValues>({
  errors,
  field,
  readOnly,
  className,
  isColombia = false
}: Props<T>) => {
  const { data, isLoading } = useSWR<IResponseContactOptions>(
    "/client/contact/options",
    fetcher,
    {}
  );

  const options =
    data?.data && typeof data.data === "object"
      ? "country_calling_code" in data.data
        ? data?.data?.country_calling_code?.map((option) => {
            return {
              value: option.id,
              label: `${option.code} ${option.country_name}`,
              className: "selectOptions"
            };
          })
        : []
      : [];

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
      />
      {errors && <Typography.Text className="textError">Obligatorio *</Typography.Text>}
    </>
  );
};
