import React, { useState, useEffect } from "react";
import { Cascader } from "antd";
import { useAppStore } from "@/lib/store/store";
import { getAllLinesByProject } from "@/services/line/line";
import { getAllZones } from "@/services/zone/zones";
import { getBusinessRulesByProjectId } from "@/services/businessRules/BR";
import { ILine } from "@/types/lines/line";
import { IZone } from "@/types/zones/IZones";
import { IChanel } from "@/types/bre/IBRE";

import "../filterCascader.scss";

interface FilterOption {
  value: string | number;
  label: string;
  isLeaf?: boolean;
  children?: FilterOption[];
}

export interface SelectedFiltersAccountingAdjustments {
  lines: number[];
  zones: number[];
  channels: number[];
}

interface AccountingAdjustmentsFilterProps {
  onFilterChange: (filters: SelectedFiltersAccountingAdjustments) => void;
}

export const AccountingAdjustmentsFilter: React.FC<AccountingAdjustmentsFilterProps> = ({
  onFilterChange
}) => {
  const { ID } = useAppStore((state) => state.selectedProject);
  const [cascaderOptions, setCascaderOptions] = useState<FilterOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linesData, zonesData, businessRulesData] = await Promise.all([
          getAllLinesByProject(ID.toString()),
          getAllZones({ idProject: ID.toString() }),
          getBusinessRulesByProjectId(ID)
        ]);

        const lines = linesData.map((line: ILine) => ({
          value: line.id,
          label: line.description_line
        }));

        const zones = zonesData.data.map((zone: IZone) => ({
          value: zone.ID,
          label: zone.ZONE_DESCRIPTION
        }));

        const channels = businessRulesData.map((channel: IChanel) => ({
          value: channel.CHANNEL_ID,
          label: channel.CHANNEL_NAME,
          children: channel.CHANNEL_LINES.map((line) => ({
            value: line.id,
            label: line.description,
            children: line.sublines.map((subline) => ({
              value: subline.id,
              label: subline.description
            }))
          }))
        }));

        setCascaderOptions([
          {
            value: "lines",
            label: "Líneas",
            children: lines
          },
          {
            value: "zones",
            label: "Zonas",
            children: zones
          },
          {
            value: "channels",
            label: "Canales",
            children: channels
          }
        ]);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchData();
  }, [ID]);

  const handleCascaderChange = (value: (string | number)[][]) => {
    updateFilters(value);
  };

  const updateFilters = (value: (string | number)[][]) => {
    const newFilters: SelectedFiltersAccountingAdjustments = {
      lines: [],
      zones: [],
      channels: []
    };

    value.forEach((path) => {
      const category = path[0] as string;
      const id = Number(path[path.length - 1]);

      switch (category) {
        case "lines":
          newFilters.lines.push(id);
          break;
        case "zones":
          newFilters.zones.push(id);
          break;
        case "channels":
          newFilters.channels.push(id);
          break;
      }
    });

    onFilterChange(newFilters);
  };

  return (
    <Cascader
      className="filterCascader"
      style={{ width: "15rem" }}
      options={cascaderOptions}
      onChange={handleCascaderChange}
      multiple
      maxTagCount="responsive"
      showCheckedStrategy={Cascader.SHOW_CHILD}
      placeholder="Seleccionar filtros"
    />
  );
};

export default AccountingAdjustmentsFilter;
