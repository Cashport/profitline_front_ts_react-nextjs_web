import { useState, useEffect } from "react";
import { Cascader } from "antd";

import { getNotificationTypes } from "@/services/notifications/notification";
import { getAllLinesByProject, getSubLinesByProject } from "@/services/line/line";
import { useAppStore } from "@/lib/store/store";

import { ILine, ISubLine } from "@/types/lines/line";

import "../filterCascader.scss";

interface FilterOption {
  value: string | number;
  label: string;
  isLeaf?: boolean;
  children?: FilterOption[];
  line_id?: string | number;
}

export interface ISelectFilterNotifications {
  lines: number[];
  sublines: number[];
  notificationTypes: number[];
}

type Props = {
  setSelectedFilters: React.Dispatch<React.SetStateAction<any>>;
};

export default function FiltersNotifications({ setSelectedFilters }: Props) {
  const { ID } = useAppStore((state) => state.selectedProject);
  const [cascaderOptions, setCascaderOptions] = useState<FilterOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<(string | number)[][]>([]);
  const [originalSublines, setOriginalSublines] = useState<FilterOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linesData, sublinesData, notificationTypes] = await Promise.all([
          getAllLinesByProject(ID.toString()),
          getSubLinesByProject(ID.toString()),
          getNotificationTypes()
        ]);

        const lines = linesData.map((line: ILine) => ({
          value: line.id,
          label: line.description_line
        }));

        const sublines = sublinesData.map((subline: ISubLine) => ({
          value: subline.id,
          label: subline.subline_description,
          line_id: subline.line_id
        }));

        const notificationType = notificationTypes.map((type) => ({
          value: type.ID,
          label: type.NAME
        }));

        setOriginalSublines(sublines); // Store the original sublines list

        setCascaderOptions([
          {
            value: "lines",
            label: "Líneas",
            children: lines
          },
          {
            value: "sublines",
            label: "Sublíneas",
            children: sublines
          },
          {
            value: "notificationType",
            label: "Tipo de notificación",
            children: notificationType
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
    const newFilters: ISelectFilterNotifications = {
      lines: [],
      sublines: [],
      notificationTypes: []
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
        case "notificationType":
          newFilters.notificationTypes.push(id);
          break;
      }
    });

    setSelectedFilters(newFilters);
  };

  return (
    <Cascader
      className="filterCascader"
      style={{ width: "130px" }}
      multiple
      maxTagCount="responsive"
      placeholder="Filtrar"
      placement="bottomRight"
      options={cascaderOptions}
      showCheckedStrategy={Cascader.SHOW_CHILD}
      onChange={handleCascaderChange}
    />
  );
}
