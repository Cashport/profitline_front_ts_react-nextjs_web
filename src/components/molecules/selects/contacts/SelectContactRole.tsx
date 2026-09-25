import { Select, Typography } from "antd";
import {
  FieldError as OriginalFieldError,
  ControllerRenderProps,
  FieldErrorsImpl,
  Merge,
  FieldValues
} from "react-hook-form";

import "./commonInputStyles.scss";

type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number; label: string }>>;

interface Props<T extends FieldValues> {
  errors: ExtendedFieldError | undefined;
  field: ControllerRenderProps<T, any>;
  readOnly?: boolean;
  options: {
    value: number;
    label: string;
    className: string;
  }[];
  isLoading: boolean;
}

export const SelectContactRole = <T extends FieldValues>({
  errors,
  field,
  readOnly,
  options,
  isLoading
}: Props<T>) => {
  return (
    <>
      <Select
        placeholder="Seleccione el tipo de radicado"
        className={errors ? "selectInputError" : `selectInputCustom ${readOnly && "--readOnly"}`}
        loading={isLoading}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        popupClassName="selectDrop"
        options={options}
        labelInValue
        open={readOnly ? false : undefined}
      />
      {errors && <Typography.Text className="textError">El rol es obligatorio *</Typography.Text>}
    </>
  );
};
