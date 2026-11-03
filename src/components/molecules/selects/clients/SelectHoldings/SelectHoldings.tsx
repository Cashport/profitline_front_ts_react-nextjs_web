import { useTranslations } from "use-intl";
import { Select, Typography } from "antd";
import {
  ControllerRenderProps,
  FieldErrorsImpl,
  Merge,
  FieldError as OriginalFieldError
} from "react-hook-form";

import { useHolding } from "@/hooks/useHolding";
import { ClientFormType } from "@/types/clients/IClients";

import "../commonInputStyles.scss";
type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number; label: string }>>;

interface Props {
  errors: ExtendedFieldError | undefined;
  field: ControllerRenderProps<ClientFormType, "infoClient.holding_id">;
}

export const SelectHoldings = ({ errors, field }: Props) => {
  const t = useTranslations("shared.selects");
  const { data, isLoading } = useHolding();
  const options = data?.data?.map((option) => {
    return {
      value: option.id,
      label: option.name,
      className: "selectOptions"
    };
  });

  options?.unshift({
    value: 0,
    label: t("unassignedOption"),
    className: "selectOptions  -noHolding"
  });

  return (
    <>
      <Select
        placeholder={t("selectHolding")}
        className={errors ? "selectInputError" : "selectInputCustom"}
        loading={isLoading}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        popupClassName="selectDrop"
        options={options}
        labelInValue
      />
      {errors && <Typography.Text className="textError">{t("holdingRequired")}</Typography.Text>}
    </>
  );
};
