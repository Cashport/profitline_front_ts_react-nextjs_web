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
  const { ID } = useAppStore((state) => state.selectedProject);
  const { data, isLoading } = useSWR<ICountries>(ID ? `/country?project_id=${ID}` : null, fetcher);
  const countries = data?.data ?? [];

  return (
    <div className="selectUserCountries">
      <Typography.Text className="title">Países</Typography.Text>
      <Flex vertical className="cardCountries">
        {isLoading ? (
          <Spin />
        ) : countries.length === 0 ? (
          <Typography.Text className="emptyText">
            No hay países disponibles para este proyecto.
          </Typography.Text>
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
                className="checboxzone"
              />
            </Flex>
          ))
        )}
      </Flex>
      {!isLoading && countryIds?.length === 0 && (
        <Typography.Text className="emptyAssignedText">
          Sin países asignados. El usuario no verá información de Data/Alertas hasta que se le
          asigne al menos un país.
        </Typography.Text>
      )}
    </div>
  );
};
