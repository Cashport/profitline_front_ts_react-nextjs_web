import { useTranslations } from "use-intl";
import { Select, Typography } from "antd";
import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { IPaymentConditions } from "@/types/paymentConditions/IPaymentConditions";
import {
  ControllerRenderProps,
  FieldErrorsImpl,
  FieldValues,
  Merge,
  FieldError as OriginalFieldError
} from "react-hook-form";

import "../commonInputStyles.scss";

type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number; label: string }>>;

interface Props<T extends FieldValues> {
  errors: ExtendedFieldError | undefined;
  field: ControllerRenderProps<T, any>;
}

export const SelectPaymentConditions = <T extends FieldValues>({ errors, field }: Props<T>) => {
  const t = useTranslations("shared.selects");
  const { data, isLoading } = useSWR<IPaymentConditions>("/client/condition-payments", fetcher, {});
  const options = data?.data.map((option) => {
    return {
      value: option.id,
      label: t("paymentConditionDays", { days: option.condition_day }),
      className: "selectOptions"
    };
  });

  return (
    <>
      <Select
        placeholder={t("paymentConditionDays", { days: 30 })}
        className={errors ? "selectInputError" : "selectInputCustom"}
        loading={isLoading}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        popupClassName="selectDrop"
        options={options}
        labelInValue
      />
      {errors && (
        <Typography.Text className="textError">{t("paymentConditionRequired")}</Typography.Text>
      )}
    </>
  );
};
