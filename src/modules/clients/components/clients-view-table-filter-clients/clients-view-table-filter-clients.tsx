import { Dispatch, FC, SetStateAction } from "react";
import "./clients-view-table-filter-clients.scss";
import { Cascader } from "antd";
import { useTranslations } from "use-intl";

interface filterClientsProps {
  setFilterClientsAccount?: Dispatch<
    SetStateAction<{
      clientsGroups: number[];
    }>
  >;
}

interface Option {
  value: string;
  label: string;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  children?: Option[];
}

const clientsViewTableFilterClients: FC<filterClientsProps> = ({ setFilterClientsAccount }) => {
  const t = useTranslations("clients.customerGroupsFilter");
  const tCommon = useTranslations("common");
  const onChange = (selectedValue: any[]) => {
    const clientsGroups: number[] = [];

    selectedValue.forEach((arraySelectedValues: any[]) => {
      if (arraySelectedValues.includes("clientsGroups")) {
        clientsGroups.push(arraySelectedValues[arraySelectedValues.length - 1]);
      }
    });

    if (setFilterClientsAccount) {
      setFilterClientsAccount((prevState) => ({
        ...prevState,
        clientsGroups
      }));
    }
  };

  const options: Option[] = [
    {
      value: "clientsGroups",
      label: t("customerGroups"),
      isLeaf: false,
      disableCheckbox: true,
      children: []
    }
  ];

  return (
    <Cascader
      className="filterCascader"
      style={{ width: "7rem" }}
      multiple
      size="large"
      removeIcon
      maxTagCount="responsive"
      placeholder={tCommon("actions.filter")}
      placement="bottomLeft"
      options={options}
      onChange={onChange}
    />
  );
};

export default clientsViewTableFilterClients;
