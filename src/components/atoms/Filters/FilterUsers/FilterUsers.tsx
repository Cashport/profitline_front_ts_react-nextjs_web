import { Dispatch, SetStateAction, useState } from "react";
import { Cascader } from "antd";

import { getAllRoles } from "@/services/roles/roles";
import { getAllZones } from "@/services/zone/zones";
import { getBusinessRulesByProjectId } from "@/services/businessRules/BR";
import { useAppStore } from "@/lib/store/store";
import { extractChannelLineSublines } from "@/utils/utils";

import "../filterCascader.scss";

interface Props {
  idProject: string;
  setSelectedUsers: Dispatch<
    SetStateAction<{
      zones: any[];
      roles: any[];
      status: "all" | "active" | "inactive";
      channel: {
        id: number;
        name: string;
      }[];
      line: {
        id: number;
        name: string;
      }[];
      subline: {
        id: number;
        name: string;
      }[];
    }>
  >;
}

export const FilterUsers = ({ idProject, setSelectedUsers }: Props) => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const [zones, setZones] = useState<any>([]);
  const [roles, setRoles] = useState<any>([]);
  const [br, setBr] = useState({
    channels: [] as { id: number; name: string }[],
    lines: [] as { id: number; name: string }[],
    sublines: [] as { id: number; name: string }[]
  });
  const [optionsList, setOptionsList] = useState(options);
  const [selectOptions, setSelectOptions] = useState([]);

  const onBlur = () => {
    if (selectOptions.length === 0) return setSelectedUsers(initValueFiltersData);
    const rolesFilters =
      selectOptions?.filter((item) => item[0] === "Roles").map((item) => item[1]) ?? 0;
    const zonesFilters =
      selectOptions?.filter((item) => item[0] === "Zona").map((item) => item[1]) ?? 0;
    const statusFilter = selectOptions?.filter((item) => item[0] === "status")?.[0]?.[1];

    const channelFilters =
      selectOptions?.filter((item) => item[0] === "channel").map((item) => item[1]) ?? 0;
    const lineFilters =
      selectOptions?.filter((item) => item[0] === "line").map((item) => item[1]) ?? 0;
    const sublineFilters =
      selectOptions?.filter((item) => item[0] === "subline").map((item) => item[1]) ?? 0;

    setSelectedUsers({
      zones: zonesFilters,
      roles: rolesFilters,
      status:
        statusFilter === "statusActive"
          ? "active"
          : statusFilter === "statusInactive"
            ? "inactive"
            : "all",
      channel: channelFilters,
      line: lineFilters,
      subline: sublineFilters
    });
  };
  const onChange = (value: any, selectedOption: any) => {
    const selectedTag = selectedOption[selectedOption.length - 1]?.[1]?.value;

    const activeTagStatus = value
      .map((item: any) => item)
      .findIndex((tag: any) => tag[1] === "statusActive");
    const inactiveTagStatus = value
      .map((item: any) => item)
      .findIndex((tag: any) => tag[1] === "statusInactive");

    // logic for active and desactive users
    if (selectedTag === "statusActive" && inactiveTagStatus >= 0)
      return setSelectOptions(value.filter((_: any, index: any) => index !== inactiveTagStatus));
    if (selectedTag === "statusInactive" && activeTagStatus >= 0)
      return setSelectOptions(value.filter((_: any, index: any) => index !== activeTagStatus));

    setSelectOptions(value);
  };

  const loadData = async (selectedOptions: any) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    if (targetOption.value === "channel") {
      if (br.channels.length === 0) {
        const data = await getBusinessRulesByProjectId(ID);
        const { channels, lines, sublines } = extractChannelLineSublines(data);
        targetOption.children = channels.map((channel) => ({
          label: channel.name,
          value: channel.id
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
          value: channel.id
        }));
      }
    }
    if (targetOption.value === "line") {
      if (br.lines.length === 0) {
        const data = await getBusinessRulesByProjectId(ID);
        const { channels, lines, sublines } = extractChannelLineSublines(data);
        targetOption.children = lines.map((channel) => ({
          label: channel.name,
          value: channel.id
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
          value: line.id
        }));
        setOptionsList([...options]);
      }
    }
    if (targetOption.value === "subline") {
      if (br.sublines.length === 0) {
        const data = await getBusinessRulesByProjectId(ID);
        const { channels, lines, sublines } = extractChannelLineSublines(data);
        targetOption.children = sublines.map((channel) => ({
          label: channel.name,
          value: channel.id
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
          value: subline.id
        }));
        setOptionsList([...options]);
      }
    }
    if (targetOption.value === "Roles" && roles.length === 0) {
      const roles = await getAllRoles();
      const countriesToShow = roles?.map((role) => ({
        label: `${role.ROL_NAME}`,
        value: `${role.ID}`
      }));
      targetOption.children = countriesToShow;
      setOptionsList([...options]);
      setRoles(countriesToShow);
    }
    if (targetOption.value === "Zona" && zones.length === 0) {
      const { data } = await getAllZones({ idProject });

      const zonesToShow = data.map((zone) => ({
        label: `${zone.ZONE_DESCRIPTION}`,
        value: `${zone.ID}`
      }));
      targetOption.children = zonesToShow;
      setOptionsList([...options]);
      setZones(zonesToShow);
    }
  };

  return (
    <Cascader
      className="filterCascader"
      style={{ width: "15rem" }}
      multiple
      removeIcon
      maxTagCount="responsive"
      placeholder="Filtrar"
      placement="bottomLeft"
      onClear={() => setSelectedUsers(initValueFiltersData)}
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
    value: "status",
    label: "Estado de Usuario",
    isLeaf: false,
    disableCheckbox: true,
    children: [
      {
        value: "statusActive",
        label: "Activo"
      },
      {
        value: "statusInactive",
        label: "Inactivo"
      }
    ]
  },
  {
    value: "Zona",
    label: "Zona",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "Roles",
    label: "Roles",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "channel",
    label: "Canales",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "line",
    label: "Lineas",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "subline",
    label: "Sublineas",
    isLeaf: false,
    disableCheckbox: true
  }
];
const initValueFiltersData = {
  zones: [] as any,
  roles: [] as any,
  status: "all" as "all" | "active" | "inactive",
  channel: [] as { id: number; name: string }[],
  line: [] as { id: number; name: string }[],
  subline: [] as { id: number; name: string }[]
};
interface Option {
  value: string;
  label: string;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  children?: Option[];
}
