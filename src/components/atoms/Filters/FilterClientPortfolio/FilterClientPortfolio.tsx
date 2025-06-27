import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Cascader } from "antd";
import { useAppStore } from "@/lib/store/store";

import { extractChannelLineSublines } from "@/utils/utils";
import { getBusinessRulesByProjectId } from "@/services/businessRules/BR";
import { getAllZones } from "@/services/zone/zones";

import "../filterCascader.scss";

interface Option {
  value: string | number;
  label: string;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  children?: Option[];
}

export interface IClientPortfolioFilters {
  zones: string[];
  lines: string[];
  sublines: string[];
  channels: string[];
  radicado: boolean;
  novedad: boolean;
  paymentAgreement: number | null;
  radicationType: number | null;
}

interface Props {
  setSelectedFilters: Dispatch<SetStateAction<IClientPortfolioFilters>>;
}

export const FilterClientPortfolio = ({ setSelectedFilters }: Props) => {
  const { ID } = useAppStore((state) => state.selectedProject);
  const [br, setBr] = useState({
    channels: [] as { id: number; name: string }[],
    lines: [] as { id: number; name: string }[],
    sublines: [] as { id: number; name: string }[]
  });
  const [optionsList, setOptionsList] = useState<Option[]>(options);
  const [selectOptions, setSelectOptions] = useState<(string | number)[][]>([]);

  useEffect(() => {
    if (selectOptions.length === 0) {
      return setSelectedFilters({
        zones: [],
        lines: [],
        sublines: [],
        channels: [],
        radicado: false,
        novedad: false,
        paymentAgreement: null,
        radicationType: null
      });
    }

    const zonesFilters = selectOptions
      .filter((item) => item[0] === "Zona")
      .map((item) => String(item[1]));
    const lineFilters = selectOptions
      .filter((item) => item[0] === "Linea")
      .map((item) => String(item[1]));
    const sublineFilters = selectOptions
      .filter((item) => item[0] === "Sublinea")
      .map((item) => String(item[1]));
    const channelsFilters = selectOptions
      .filter((item) => item[0] === "Canal")
      .map((item) => String(item[1]));

    const paymentAgreement = selectOptions.find((item) => item[0] === "paymentAgreement");
    const radicationType = selectOptions.find((item) => item[0] === "radicationType");

    setSelectedFilters({
      zones: zonesFilters,
      lines: lineFilters,
      sublines: sublineFilters,
      channels: channelsFilters,
      radicado: selectOptions.some((item) => item[0] === "radicado"),
      novedad: selectOptions.some((item) => item[0] === "novedad"),
      paymentAgreement: paymentAgreement ? Number(paymentAgreement[1]) : null,
      radicationType: radicationType ? Number(radicationType[1]) : null
    });
  }, [selectOptions]);

  const onChange = (value: (string | number)[][]) => {
    setSelectOptions(value);
  };

  const loadData = async (selectedOptions: Option[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];

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
      style={{ width: "15rem", height: "46px" }}
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
    value: "paymentAgreement",
    label: "Acuerdo de pago",
    children: [
      { value: 1, label: "Sí" },
      { value: 0, label: "No" }
    ],
    disableCheckbox: true
  },
  {
    value: "radicationType",
    label: "Tipo de radicación",
    isLeaf: false,
    children: [
      { value: 1, label: "Sí" },
      { value: 0, label: "No" }
    ],
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
  zones: [],
  channels: [],
  lines: [],
  sublines: [],
  radicado: false,
  novedad: false,
  paymentAgreement: null,
  radicationType: null
};
