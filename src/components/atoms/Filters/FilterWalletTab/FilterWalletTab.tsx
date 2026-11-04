import React, { useState, useEffect, ReactNode } from "react";
import { Cascader } from "antd";
import { useTranslations } from "use-intl";
import { useAppStore } from "@/lib/store/store";
import { getAllLinesByProject, getSubLinesByProject } from "@/services/line/line";
import { getAllZones } from "@/services/zone/zones";
import { getChannelByProjectId } from "@/services/businessRules/BR";
import { ILine, ISubLine } from "@/types/lines/line";
import { IZone } from "@/types/zones/IZones";

import { filterLabel } from "../FilterLabel";
import "../filterCascader.scss";
import { channel } from "@/types/bre/IBRE";

interface FilterOption {
  value: string | number;
  label: ReactNode;
  isLeaf?: boolean;
  children?: FilterOption[];
  line_id?: string | number;
}

export interface SelectedFiltersWallet {
  lines: number[];
  zones: number[];
  sublines: number[];
  channels: number[];
  paymentAgreement: number | null;
  radicationType: number | null;
}

interface Props {
  setSelectedFilters: React.Dispatch<React.SetStateAction<SelectedFiltersWallet>>;
}

export const WalletTabFilter: React.FC<Props> = ({ setSelectedFilters }) => {
  const t = useTranslations("components.filters");
  const { ID } = useAppStore((state) => state.selectedProject);
  const [cascaderOptions, setCascaderOptions] = useState<FilterOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<(string | number)[][]>([]);
  const [originalSublines, setOriginalSublines] = useState<FilterOption[]>([]); // Store original sublines data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linesData, zonesData, channelsData, sublinesData] = await Promise.all([
          getAllLinesByProject(ID.toString()),
          getAllZones({ idProject: ID.toString() }),
          getChannelByProjectId(ID),
          getSubLinesByProject(ID.toString())
        ]);

        const lines = linesData.map((line: ILine) => ({
          value: line.id,
          label: line.description_line
        }));

        const zones = zonesData.data.map((zone: IZone) => ({
          value: zone.ID,
          label: zone.ZONE_DESCRIPTION
        }));

        const channels = channelsData.map((channel: channel) => ({
          value: channel.id,
          label: channel.channel_description
        }));

        const sublines = sublinesData.map((subline: ISubLine) => ({
          value: subline.id,
          label: subline.subline_description,
          line_id: subline.line_id
        }));

        setOriginalSublines(sublines); // Store the original sublines list

        setCascaderOptions([
          {
            value: "lines",
            label: filterLabel("lines"),
            children: lines
          },
          {
            value: "sublines",
            label: filterLabel("sublines"),
            children: sublines
          },
          {
            value: "zones",
            label: filterLabel("zones"),
            children: zones
          },
          {
            value: "channels",
            label: filterLabel("channels"),
            children: channels
          },
          {
            value: "paymentAgreement",
            label: filterLabel("paymentAgreement"),
            children: [
              { value: 1, label: filterLabel("yes") },
              { value: 0, label: filterLabel("no") }
            ]
          },
          {
            value: "radicationType",
            label: filterLabel("radicationType"),
            isLeaf: false,
            children: [
              { value: 1, label: filterLabel("yes") },
              { value: 0, label: filterLabel("no") }
            ]
          }
        ]);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchData();
  }, [ID]);

  const updateCascaderOptions = (filteredSublines: FilterOption[]) => {
    setCascaderOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.value === "sublines" ? { ...option, children: filteredSublines } : option
      )
    );
  };

  useEffect(() => {
    // Find all selected line IDs from selectedOptions
    const selectedLinesIds = selectedOptions
      .filter((option) => option[0] === "lines") // Get all the selected lines
      .map((option) => option.slice(1)) // Extract the actual IDs
      .flat(); // Flatten the array to handle multiple selected lines

    if (selectedLinesIds.length > 0) {
      // Filter sublines that belong to any of the selected line IDs
      const filteredSublines = originalSublines.filter(
        (subline) => subline.line_id && selectedLinesIds.includes(subline.line_id)
      );

      updateCascaderOptions(filteredSublines);
    } else {
      // Reset to show all sublines if no lines are selected
      updateCascaderOptions(originalSublines);
    }
  }, [selectedOptions, originalSublines]);

  const handleCascaderChange = (value: (string | number)[][]) => {
    setSelectedOptions(value);
    updateFilters(value);
  };

  const updateFilters = (value: (string | number)[][]) => {
    const newFilters: SelectedFiltersWallet = {
      lines: [],
      zones: [],
      sublines: [],
      channels: [],
      paymentAgreement: null,
      radicationType: null
    };

    value.forEach((path) => {
      const category = path[0] as string;
      const id = Number(path[path.length - 1]);

      switch (category) {
        case "lines":
          newFilters.lines.push(id);
          break;
        case "sublines":
          newFilters.sublines.push(id);
          break;
        case "zones":
          newFilters.zones.push(id);
          break;
        case "channels":
          newFilters.channels.push(id);
          break;
        case "paymentAgreement":
          newFilters.paymentAgreement = id;
          break;
        case "radicationType":
          newFilters.radicationType = id;
          break;
      }
    });

    setSelectedFilters(newFilters);
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
      placeholder={t("selectFilters")}
    />
  );
};
