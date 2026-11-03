import { Cascader } from "antd";
import { Dispatch, SetStateAction } from "react";
import { IClient } from "@/types/clients/IClients";
import { useClients } from "@/hooks/useClients";
import { useParams } from "next/navigation";

import "../filterCascader.scss";

interface Option {
  value: string;
  label: string;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  children?: Option[];
}

interface FilterClientsProps {
  setFilterClients: Dispatch<
    SetStateAction<{
      city: number[];
      holding: number[];
      risk: number[];
      payment_condition: number[];
      radication_type: number[];
      status: number[];
    }>
  >;
}

export const FilterClients = ({ setFilterClients }: FilterClientsProps) => {
  const { id: idProject } = useParams<{ id: string }>();

  const { data: filterOptions } = useClients({
    idProject,
    page: 1,
    city: [] as number[],
    holding: [] as number[],
    risk: [] as number[],
    payment_condition: [] as number[],
    radication_type: [] as number[],
    status: [] as number[],
    searchQuery: ""
  });

  const onChange = (selectedValue: any[]) => {
    const city: number[] = [];
    const holding: number[] = [];
    const risk: number[] = [];
    const radication_type: number[] = [];
    const status: number[] = [];

    selectedValue.forEach((arraySelectedValues: any[]) => {
      if (arraySelectedValues.includes("cities")) {
        city.push(arraySelectedValues[arraySelectedValues.length - 1]);
      }

      if (arraySelectedValues.includes("holdings")) {
        holding.push(arraySelectedValues[arraySelectedValues.length - 1]);
      }

      if (arraySelectedValues.includes("status")) {
        status.push(arraySelectedValues[arraySelectedValues.length - 1]);
      }

      if (arraySelectedValues.includes("risks")) {
        risk.push(arraySelectedValues[arraySelectedValues.length - 1]);
      }

      if (arraySelectedValues.includes("radicationTypes")) {
        radication_type.push(arraySelectedValues[arraySelectedValues.length - 1]);
      }
    });

    setFilterClients((prevState) => ({
      ...prevState,
      city,
      holding,
      status,
      risk,
      radication_type
    }));
  };

  const createCitiesChildren = (clients: IClient[]) => {
    const cities = new Set();

    clients?.forEach((client) => {
      if (Array.isArray(client?.locations)) {
        client?.locations?.forEach((location) => {
          if (location?.id && location?.city) {
            const city = { value: location.id, label: location.city };

            cities.add(JSON.stringify(city));
          }
        });
      }
    });
    const citiesArray = Array.from(cities).map((city: any) => JSON.parse(city));

    return citiesArray;
  };

  const createHoldings = (clients: IClient[]) => {
    const holdings = new Set();

    clients?.forEach((client) => {
      if (client.holding_id && client.holding_name) {
        const holding = { value: client.holding_id, label: client.holding_name };
        holdings.add(JSON.stringify(holding));
      }
    });
    const holdingsArray = Array.from(holdings).map((city: any) => JSON.parse(city));

    return holdingsArray;
  };

  const createChildrenRisk = (client: IClient[]) => {
    const riskSet = new Set();

    client?.forEach((client) => {
      let risk = {};

      if (client.risk) {
        switch (client.risk) {
          case "Bajo":
            risk = { value: 1, label: client.risk };
            break;
          case "Medio bajo":
            risk = { value: 2, label: client.risk };
            break;
          case "Medio":
            risk = { value: 3, label: client.risk };
            break;
          case "Medio alto":
            risk = { value: 4, label: client.risk };
            break;
          case "Alto":
            risk = { value: 5, label: client.risk };
            break;
          case "No calculado":
            risk = { value: 6, label: client.risk };
            break;
        }
        riskSet.add(JSON.stringify(risk));
      }
    });
    const riskArray = Array.from(riskSet).map((city: any) => JSON.parse(city));
    return riskArray;
  };

  const createChildrenRadicationType = (client: IClient[]) => {
    const radicationTypeSet = new Set();

    client?.forEach((client: IClient) => {
      let radication_type = {};

      if (client.radication_type) {
        switch (client.radication_type) {
          case 1:
            radication_type = { value: client.radication_type, label: "email" };
            break;
          case 2:
            radication_type = { value: client.radication_type, label: "web" };
            break;
          case 3:
            radication_type = { value: client.radication_type, label: "radian" };
            break;
          case 4:
            radication_type = { value: client.radication_type, label: "fisica" };
            break;
          case 5:
            radication_type = { value: client.radication_type, label: "fisica y web" };
            break;
        }
        radicationTypeSet.add(JSON.stringify(radication_type));
      }
    });
    const radicationTypeArray = Array.from(radicationTypeSet).map((city: any) => JSON.parse(city));
    return radicationTypeArray;
  };

  const createStatusChildren = (client: IClient[]) => {
    const statusSet = new Set();

    client?.forEach((client) => {
      let status = {};
      if (client.status) {
        switch (client.status) {
          case "creado":
            status = { value: 1, label: client.status };
            break;
          case "aprobado":
            status = { value: 2, label: client.status };
            break;
          case "rechazado":
            status = { value: 3, label: client.status };
            break;
          case "bloqueado":
            status = { value: 4, label: client.status };
            break;
          case "juridico":
            status = { value: 5, label: client.status };
            break;
          case "casa de cobro":
            status = { value: 6, label: client.status };
            break;
        }
        statusSet.add(JSON.stringify(status));
      }
    });
    const statusArray = Array.from(statusSet).map((city: any) => JSON.parse(city));

    return statusArray;
  };

  const cities = createCitiesChildren(filterOptions);
  const holdings = createHoldings(filterOptions);
  const risks = createChildrenRisk(filterOptions);
  const radicationTypes = createChildrenRadicationType(filterOptions);
  const status = createStatusChildren(filterOptions);

  const options: Option[] = [
    {
      value: "cities",
      label: "Ciudad",
      isLeaf: false,
      disableCheckbox: true,
      children: cities
    },
    {
      value: "holdings",
      label: "Holding",
      isLeaf: false,
      disableCheckbox: true,
      children: holdings
    },
    {
      value: "status",
      label: "Estado",
      isLeaf: false,
      disableCheckbox: true,
      children: status
    },
    {
      value: "risks",
      label: "Riesgo",
      isLeaf: false,
      disableCheckbox: true,
      children: risks
    },
    {
      value: "radicationTypes",
      label: "Tipo de radicado",
      isLeaf: false,
      disableCheckbox: true,
      children: radicationTypes
    }
  ];

  return (
    <Cascader
      className="filterCascader"
      style={{ width: "15rem" }}
      multiple
      removeIcon
      maxTagCount="responsive"
      placeholder="Filtrar"
      placement="bottomLeft"
      options={options}
      onChange={onChange}
    />
  );
};
