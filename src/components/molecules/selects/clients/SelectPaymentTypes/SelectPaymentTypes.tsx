import { useTranslations } from "use-intl";
import { Select, Typography } from "antd";
import {
  ControllerRenderProps,
  FieldErrorsImpl,
  Merge,
  FieldError as OriginalFieldError,
  FieldValues
} from "react-hook-form";

import { PAYMENT_TYPES } from "@/constants/documentTypes";

import "../commonInputStyles.scss";

type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number; label: string }>>;

interface Props<T extends FieldValues> {
  errors: ExtendedFieldError | undefined;
  field: ControllerRenderProps<T, any>;
}

export const SelectPaymentTypes = <T extends FieldValues>({ errors, field }: Props<T>) => {
  const t = useTranslations("shared.selects");
  const options = PAYMENT_TYPES.map((option) => ({
    value: option.id,
    label: option.label,
    className: "selectOptions"
  }));

  return (
    <>
      <Select
        placeholder={t("selectPaymentType")}
        className={errors ? "selectInputError" : "selectInputCustom"}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        popupClassName="selectDrop"
        options={options}
        labelInValue
      />
      {errors && (
        <Typography.Text className="textError">{t("paymentTypeRequired")}</Typography.Text>
      )}
    </>
  );
};
