import React, { useState, useEffect } from "react";
import { Cascader } from "antd";
import { useTranslations } from "use-intl";
import "../filterCascader.scss";
export interface FilterOption {
  id: string;
  name: string;
  isLeaf?: boolean;
  children?: FilterOption[];
}

interface CascaderOption {
  value: string;
  label: string;
  isLeaf?: boolean;
  children?: CascaderOption[];
}

interface ApiCallbacks {
  [key: string]: (parentIds: string[]) => Promise<FilterOption[]>;
}

interface GenericCascaderFilterProps {
  getFilters: () => Promise<FilterOption[]>;
  apiCallbacks: ApiCallbacks;
  onFilterChange: (filteredData: { [key: string]: string[] }) => void;
}

const GenericCascaderFilter: React.FC<GenericCascaderFilterProps> = ({
  getFilters,
  apiCallbacks,
  onFilterChange
}) => {
  const t = useTranslations("components.filters");
  const [options, setOptions] = useState<CascaderOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[][]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const filters = await getFilters();
        const initialOptions: CascaderOption[] = filters.map((filter) => ({
          value: filter.id,
          label: filter.name,
          isLeaf: !apiCallbacks[filter.id] || filter.isLeaf,
          children: apiCallbacks[filter.id] ? [] : undefined
        }));
        setOptions(initialOptions);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, [getFilters, apiCallbacks]);

  const loadData = async (selectedOptions: CascaderOption[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    const parentIds = selectedOptions.map((option) => option.value);

    if (apiCallbacks[parentIds[0]]) {
      try {
        const data = await apiCallbacks[parentIds[0]](parentIds.slice(1));

        const children: CascaderOption[] = data.map((item) => ({
          label: item.name,
          value: item.id,
          isLeaf: parentIds[0] !== "location" || parentIds.length === 2,
          children: parentIds[0] === "location" && parentIds.length < 2 ? [] : undefined
        }));

        targetOption.children = children;
        setOptions([...options]);
      } catch (error) {
        console.error(`Error loading data for ${targetOption.label}:`, error);
      }
    }
  };

  const onChange = (value: string[][]) => {
    setSelectedOptions(value);

    const filteredData: { [key: string]: string[] } = {};
    value.forEach((path) => {
      filteredData[path[0]] = path.slice(1);
    });

    onFilterChange(filteredData);
  };

  return (
    <Cascader
      style={{ width: "15rem" }}
      options={options}
      loadData={loadData}
      onChange={onChange}
      value={selectedOptions}
      multiple
      className="filterCascader"
      changeOnSelect
      expandTrigger="hover"
      placeholder={t("selectFilters")}
    />
  );
};

export default GenericCascaderFilter;
