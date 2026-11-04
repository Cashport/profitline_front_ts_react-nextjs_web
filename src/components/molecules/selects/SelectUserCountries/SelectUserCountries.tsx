import { useTranslations } from "use-intl";
import { Dispatch, SetStateAction } from "react";
import { Checkbox, Flex, Spin, Typography } from "antd";
import useSWR from "swr";

import { ICountries } from "@/types/countries/ICountries";
import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";

import "./selectUserCountries.scss";

interface Props {
  disabled?: boolean;
  countryIds: number[];
  setCountryIds: Dispatch<SetStateAction<number[]>>;
}

// Catálogo autorizado: solo países con clientes activos en el proyecto actual (GET /country?project_id=).
export const SelectUserCountries = ({ disabled, countryIds, setCountryIds }: Props) => {
  const t = useTranslations("shared.selects");
  const { ID } = useAppStore((state) => state.selectedProject);
  const { data, isLoading, error } = useSWR<ICountries>(
    ID ? `/country?project_id=${ID}` : null,
    fetcher
  );
  const countries = data?.data ?? [];

  return (
    <div className="selectUserCountries">
      <Typography.Text className="title">{t("countries")}</Typography.Text>
      <Flex vertical className="cardCountries">
        {error ? (
          <Typography.Text type="danger" role="alert">
            {error instanceof Error ? error.message : t("countriesLoadError")}
          </Typography.Text>
        ) : isLoading ? (
          <Spin />
        ) : countries.length === 0 ? (
          <Typography.Text className="emptyText">{t("noCountriesForProject")}</Typography.Text>
        ) : (
          countries.map((country) => (
            <Flex key={country.id} justify="space-between" className="cardCountries__country">
              <Typography.Text>{country.country_name}</Typography.Text>
              <Checkbox
                checked={countryIds?.includes(country.id)}
                disabled={disabled}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCountryIds([...countryIds, country.id]);
                  } else {
                    setCountryIds(countryIds.filter((id) => id !== country.id));
                  }
                }}
                className="checkboxCountry"
              />
            </Flex>
          ))
        )}
      </Flex>
      {!isLoading && !error && countryIds?.length === 0 && (
        <Typography.Text className="emptyAssignedText">{t("noCountriesAssigned")}</Typography.Text>
      )}
    </div>
  );
};
