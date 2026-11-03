import { Select } from "antd";
import useSWR from "swr";
import { useTranslations } from "use-intl";

import { fetcher } from "@/utils/api/api";
import { ICurrencies } from "@/types/currencies/ICurrencies";

import "./selectcurrencies.scss";

interface Props {
  errors: any;
  field: any;
}

export const SelectCurrencies = ({ errors, field }: Props) => {
  const t = useTranslations("shared.selects");
  const { data, isLoading } = useSWR<ICurrencies>("/currency", fetcher, {});
  const options = data?.data.map((option) => {
    return {
      value: option.ID,
      label: option.CURRENCY_NAME
    };
  });

  return (
    <Select
      mode="multiple"
      placeholder={t("selectCurrencies")}
      className={
        errors?.general?.currencies ? "selectInputCurrenciesError" : "selectInputCurrencies"
      }
      loading={isLoading}
      variant="borderless"
      optionLabelProp="label"
      {...field}
      options={options}
      labelInValue
    />
  );
};
