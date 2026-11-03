import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { Cascader } from "antd";
import { useTranslations } from "use-intl";

import { getAllCountries } from "@/services/countries/countries";
import { getAllCurrencies } from "@/services/currencies/currencies";

import { filterLabel } from "../FilterLabel";
import "../filterCascader.scss";

interface Option {
  value: string;
  label: ReactNode;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  children?: Option[];
}

interface Props {
  setSelecetedProjects: Dispatch<SetStateAction<{ country: string[]; currency: string[] }>>;
}
export const FilterProjects = ({ setSelecetedProjects }: Props) => {
  const tCommon = useTranslations("common");
  const [countries, setCountries] = useState<any>([]);
  const [currencies, setCurrencies] = useState<any>([]);

  const [optionsList, setOptionsList] = useState(options);
  const [selectOptions, setSelectOptions] = useState([]);

  const onBlur = () => {
    if (selectOptions.length === 0)
      return setSelecetedProjects({
        country: [],
        currency: []
      });
    const countriesFilters =
      selectOptions?.filter((item) => item[0] === "Pais").map((item) => item[1]) ?? 0;
    const currenciesFilters =
      selectOptions?.filter((item) => item[0] === "Currencia").map((item) => item[1]) ?? 0;

    setSelecetedProjects({
      country: countriesFilters,
      currency: currenciesFilters
    });
  };
  const onChange = (value: any) => {
    const data = value;
    setSelectOptions(data);
  };

  const loadData = async (selectedOptions: any) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];

    if (targetOption.value === "Pais" && countries.length === 0) {
      const data = await getAllCountries();
      const countriesToShow = data.map((country) => ({
        label: `${country.country_name}`,
        value: `${country.id}`
      }));
      targetOption.children = countriesToShow;
      setOptionsList([...options]);
      setCountries(countriesToShow);
    }
    if (targetOption.value === "Currencia" && currencies.length === 0) {
      const data = await getAllCurrencies();
      const countriesToShow = data.map((country) => ({
        label: `${country.CURRENCY_NAME}`,
        value: `${country.ID}`
      }));
      targetOption.children = countriesToShow;
      setOptionsList([...options]);
      setCurrencies(countriesToShow);
    }
  };

  return (
    <Cascader
      className="filterCascader"
      style={{ width: "130px" }}
      multiple
      removeIcon
      maxTagCount="responsive"
      placeholder={tCommon("actions.filter")}
      placement="bottomRight"
      onClear={() => setSelecetedProjects({ country: [], currency: [] })}
      options={optionsList}
      changeOnSelect
      loadData={loadData}
      value={selectOptions}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
};
const options: Option[] = [
  {
    value: "Pais",
    label: filterLabel("country"),
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "Currencia",
    label: filterLabel("currency"),
    isLeaf: false,
    disableCheckbox: true
  }
];
