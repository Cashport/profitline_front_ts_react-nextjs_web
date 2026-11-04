import { Select } from "antd";
import useSWR from "swr";
import { useTranslations } from "use-intl";

import { ICountries } from "@/types/countries/ICountries";
import { fetcher } from "@/utils/api/api";

import "./selectcountries.scss";

interface Props {
  errors: any;
  field: any;
}

export const SelectCountries = ({ errors, field }: Props) => {
  const t = useTranslations("shared.selects");
  const { data, isLoading } = useSWR<ICountries>("/country", fetcher, {});
  const options = data?.data.map((option) => {
    return {
      value: option.id,
      label: option.country_name
    };
  });

  return (
    <Select
      placeholder={t("selectCountry")}
      className={errors?.general?.country ? "selectInputCountryError" : "selectInputCountry"}
      loading={isLoading}
      variant="borderless"
      optionLabelProp="label"
      {...field}
      options={options}
      labelInValue
    />
  );
};
