import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Cascader } from "antd";
import { useAppStore } from "@/lib/store/store";

import { extractChannelLineSublines } from "@/utils/utils";
import { getBusinessRulesByProjectId } from "@/services/businessRules/BR";
import { getClientGroups } from "@/services/groupClients/groupClients";
import { getHoldingsByProjectId } from "@/services/holding/holding";
import { getAllZones } from "@/services/zone/zones";

import { IClientsGroupsFull } from "@/types/clientsGroups/IClientsGroups";

import "../filterCascader.scss";
interface Option {
  value: string;
  label: string;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  children?: Option[];
}

export interface SelectedFilters {
  holding: string[];
  clientGroup: string[];
  zones: string[];
  lines: string[];
  sublines: string[];
  channels: string[];
  radicado: boolean;
  novedad: boolean;
}

interface Props {
  setSelectedFilters: Dispatch<SetStateAction<SelectedFilters>>;
}

export const FilterPortfolio = ({ setSelectedFilters }: Props) => {
  const { ID } = useAppStore((state) => state.selectedProject);
  const [holdings, setHoldings] = useState<Option[]>([]);
  const [clientGroups, setClientGroups] = useState<Option[]>([]);
  const [br, setBr] = useState({
    channels: [] as { id: number; name: string }[],
    lines: [] as { id: number; name: string }[],
    sublines: [] as { id: number; name: string }[]
  });
  const [optionsList, setOptionsList] = useState<Option[]>(options);
  const [selectOptions, setSelectOptions] = useState<string[][]>([]);

  useEffect(() => {
    if (selectOptions.length === 0) {
      return setSelectedFilters({
        holding: [],
        clientGroup: [],
        zones: [],
        lines: [],
        sublines: [],
        channels: [],
        radicado: false,
        novedad: false
      });
    }

    const holdingFilters = selectOptions
      .filter((item) => item[0] === "Holding")
      .map((item) => item[1]);
    const clientGroupFilters = selectOptions
      .filter((item) => item[0] === "Grupo de Cliente")
      .map((item) => item[1]);
    const zonesFilters = selectOptions.filter((item) => item[0] === "Zona").map((item) => item[1]);
    const lineFilters = selectOptions.filter((item) => item[0] === "Linea").map((item) => item[1]);
    const sublineFilters = selectOptions
      .filter((item) => item[0] === "Sublinea")
      .map((item) => item[1]);
    const channelsFilters = selectOptions
      .filter((item) => item[0] === "Canal")
      .map((item) => item[1]);

    setSelectedFilters({
      holding: holdingFilters,
      clientGroup: clientGroupFilters,
      zones: zonesFilters,
      lines: lineFilters,
      sublines: sublineFilters,
      channels: channelsFilters,
      radicado: selectOptions.some((item) => item[0] === "radicado"),
      novedad: selectOptions.some((item) => item[0] === "novedad")
    });
  }, [selectOptions]);

  const onChange = (value: string[][]) => {
    setSelectOptions(value);
  };

  const loadData = async (selectedOptions: Option[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];

    if (targetOption.value === "Holding" && holdings.length === 0) {
      try {
        const holdingsData = await getHoldingsByProjectId(ID);
        const holdingsToShow: Option[] = holdingsData.map((holding) => ({
          label: holding.name,
          value: holding.id.toString()
        }));
        targetOption.children = holdingsToShow;
        setOptionsList([...optionsList]);
        setHoldings(holdingsToShow);
      } catch (error) {
        console.error("Error fetching holdings:", error);
      }
    }

    if (targetOption.value === "Grupo de Cliente" && clientGroups.length === 0) {
      try {
        const response = await getClientGroups();
        const clientGroupsData = response as IClientsGroupsFull;
        const clientGroupsToShow: Option[] = clientGroupsData.data.map((group) => ({
          label: group.group_name,
          value: group.id.toString()
        }));
        targetOption.children = clientGroupsToShow;
        setOptionsList([...optionsList]);
        setClientGroups(clientGroupsToShow);
      } catch (error) {
        console.error("Error fetching client groups:", error);
      }
    }

    if (targetOption.value === "Zona") {
      const { data } = await getAllZones({ idProject: ID.toString() });

      const zonesToShow = data.map((zone) => ({
        label: `${zone.ZONE_DESCRIPTION}`,
        value: `${zone.ID}`
      }));
      targetOption.children = zonesToShow;
      setOptionsList([...options]);
    }

    if (targetOption.value === "Canal") {
      if (br.channels.length === 0) {
        const data = await getBusinessRulesByProjectId(ID);
        const { channels, lines, sublines } = extractChannelLineSublines(data);
        targetOption.children = channels.map((channel) => ({
          label: channel.name,
          value: channel.id.toString()
        }));
        setOptionsList([...options]);
        setBr({
          channels,
          lines,
          sublines
        });
      } else {
        targetOption.children = br.channels.map((channel) => ({
          label: channel.name,
          value: channel.id.toString()
        }));
      }
    }

    if (targetOption.value === "Linea") {
      if (br.lines.length === 0) {
        const data = await getBusinessRulesByProjectId(ID);
        const { channels, lines, sublines } = extractChannelLineSublines(data);
        targetOption.children = lines.map((channel) => ({
          label: channel.name,
          value: channel.id.toString()
        }));
        setOptionsList([...options]);
        setBr({
          channels,
          lines,
          sublines
        });
      } else {
        targetOption.children = br.lines.map((line) => ({
          label: line.name,
          value: line.id.toString()
        }));
        setOptionsList([...options]);
      }
    }

    if (targetOption.value === "Sublinea") {
      if (br.sublines.length === 0) {
        const data = await getBusinessRulesByProjectId(ID);
        const { channels, lines, sublines } = extractChannelLineSublines(data);
        targetOption.children = sublines.map((channel) => ({
          label: channel.name,
          value: channel.id.toString()
        }));
        setOptionsList([...options]);
        setBr({
          channels,
          lines,
          sublines
        });
      } else {
        targetOption.children = br.sublines.map((subline) => ({
          label: subline.name,
          value: subline.id.toString()
        }));
        setOptionsList([...options]);
      }
    }

    if (targetOption.value === "radicado") {
    }
  };

  return (
    <Cascader
      className="filterCascader"
      style={{ width: "120px", height: "46px" }}
      multiple
      size="large"
      removeIcon
      maxTagCount="responsive"
      placeholder="Filtrar"
      placement="bottomLeft"
      onClear={() => setSelectedFilters(initValueFiltersData)}
      options={optionsList}
      changeOnSelect
      loadData={loadData}
      value={selectOptions}
      onChange={onChange}
    />
  );
};

const options: Option[] = [
  {
    value: "Holding",
    label: "Holding",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "Grupo de Cliente",
    label: "Grupo de Cliente",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "Zona",
    label: "Zona",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "Canal",
    label: "Canal",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "Linea",
    label: "Línea",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "Sublinea",
    label: "Sublínea",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "radicado",
    label: "Radicado"
  },
  {
    value: "novedad",
    label: "Novedad"
  }
];

const initValueFiltersData = {
  holding: [],
  clientGroup: [],
  zones: [],
  channels: [],
  lines: [],
  sublines: [],
  radicado: false,
  novedad: false
};
