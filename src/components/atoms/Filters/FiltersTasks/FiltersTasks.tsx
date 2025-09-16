import { useState, useEffect } from "react";
import { Cascader } from "antd";
import { getTasksStatus, getTaskTypes } from "@/services/tasks/tasks";

import { ITaskStatus, ITaskTypes } from "@/types/tasks/ITasks";

import "../filterCascader.scss";

interface FilterOption {
  value: string | number;
  label: string;
  isLeaf?: boolean;
  children?: FilterOption[];
}

export interface ISelectFilterTasks {
  statuses: string[];
  taskTypes: number[];
}

type Props = {
  setSelectedFilters: React.Dispatch<React.SetStateAction<ISelectFilterTasks>>;
};

export default function FiltersTasks({ setSelectedFilters }: Props) {
  const [cascaderOptions, setCascaderOptions] = useState<FilterOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusesData, taskTypesData] = await Promise.all([getTasksStatus(), getTaskTypes()]);

        const statuses = statusesData.map((status: ITaskStatus) => ({
          value: status.id,
          label: status.name
        }));

        const taskTypes = taskTypesData.map((type: ITaskTypes) => ({
          value: type.ID,
          label: type.NAME
        }));

        setCascaderOptions([
          {
            value: "statuses",
            label: "Estado",
            children: statuses
          },
          {
            value: "taskTypes",
            label: "Tipo de tarea",
            children: taskTypes
          }
        ]);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchData();
  }, []);

  const handleCascaderChange = (value: (string | number)[][]) => {
    updateFilters(value);
  };

  const updateFilters = (value: (string | number)[][]) => {
    const newFilters: ISelectFilterTasks = {
      statuses: [],
      taskTypes: []
    };

    value.forEach((path) => {
      const category = path[0] as string;
      const id = path[path.length - 1];

      switch (category) {
        case "statuses":
          newFilters.statuses.push(id as string);
          break;
        case "taskTypes":
          newFilters.taskTypes.push(Number(id));
          break;
      }
    });

    setSelectedFilters(newFilters);
  };

  return (
    <Cascader
      className="filterCascader"
      style={{ width: "180px", height: "100%" }}
      size="large"
      multiple
      maxTagCount="responsive"
      placeholder="Filtrar"
      options={cascaderOptions}
      showCheckedStrategy={Cascader.SHOW_CHILD}
      onChange={handleCascaderChange}
    />
  );
}
