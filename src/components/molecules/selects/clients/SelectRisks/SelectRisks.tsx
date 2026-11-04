import { useTranslations } from "use-intl";
import { Select, Typography } from "antd";
import useSWR from "swr";

import { fetcher } from "@/utils/api/api";

import { IRisks } from "@/types/risks/IRisks";
import { ClientFormType } from "@/types/clients/IClients";
import { FieldError, ControllerRenderProps } from "react-hook-form";

import "../commonInputStyles.scss";

interface Props {
  errors: FieldError | undefined;
  field: ControllerRenderProps<ClientFormType, "infoClient.risk">;
}

export const SelectRisks = ({ errors, field }: Props) => {
  const t = useTranslations("shared.selects");
  const { data, isLoading } = useSWR<IRisks>("/risk", fetcher, {});
  const options = data?.data.map((option) => {
    return {
      value: option.id,
      label: option.risk_name,
      className: "selectOptions"
    };
  });

  return (
    <>
      <Select
        placeholder={t("selectRisk")}
        className={errors ? "selectInputError" : "selectInputCustom"}
        loading={isLoading}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        popupClassName="selectDrop"
        options={options}
      />
      {errors && <Typography.Text className="textError">{t("riskRequired")}</Typography.Text>}
    </>
  );
};
