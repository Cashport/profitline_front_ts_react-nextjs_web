import { Dispatch, SetStateAction, useEffect, useMemo, useState, ReactNode } from "react";
import dayjs from "dayjs";
import { Cascader } from "antd";
import { getTasksStatus, getTaskTypes } from "@/services/tasks/tasks";

import { ITaskStatus, ITaskTypes } from "@/types/tasks/ITasks";

import "../filterCascader.scss";

interface FilterOption {
  value: string;
  label: string | ReactNode;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  children?: FilterOption[];
}

export interface ISelectFilterTasks {
  statuses: string[];
  taskTypes: number[];
  dates: string[];
}

type Props = {
  setSelectedFilters: Dispatch<SetStateAction<ISelectFilterTasks>>;
  handleOpenCustomDate?: () => void;
  customDate: string;
  setCustomDate: Dispatch<SetStateAction<string>>;
};

export default function FiltersTasks({
  setSelectedFilters,
  handleOpenCustomDate,
  customDate,
  setCustomDate
}: Props) {
  const [optionsList, setOptionsList] = useState<FilterOption[]>(initialOptions);
  const [selectedValues, setSelectedValues] = useState<string[][]>([]);
  const [openOption, setOpenOption] = useState<string | null>(null);

  const dates = useMemo(
    () => [
      {
        label: "Últimos 7 días",
        value: `${dayjs().subtract(7, "day").format("YYYY-MM-DD")}|${dayjs().format("YYYY-MM-DD")}`
      },
      {
        label: "Últimos 30 días",
        value: `${dayjs().subtract(30, "day").format("YYYY-MM-DD")}|${dayjs().format("YYYY-MM-DD")}`
      },
      {
        label: "Este mes",
        value: `${dayjs().startOf("month").format("YYYY-MM-DD")}|${dayjs().endOf("month").format("YYYY-MM-DD")}`
      },
      {
        label: "Este trimestre",
        value: `${dayjs()
          .utc()
          .startOf("month")
          .subtract(dayjs().utc().month() % 3, "month")
          .startOf("month")
          .format("YYYY-MM-DD")}|${dayjs()
          .utc()
          .startOf("month")
          .add(3 - (dayjs().utc().month() % 3), "month")
          .subtract(1, "day")
          .format("YYYY-MM-DD")}`
      },
      {
        label: "Este año",
        value: `${dayjs().utc().startOf("year").format("YYYY-MM-DD")}|${dayjs().utc().endOf("year").format("YYYY-MM-DD")}`
      },
      {
        label: "Trimestre pasado",
        value: (() => {
          const currentMonth = dayjs().utc().month();
          const startMonth = currentMonth - (currentMonth % 3) - 3;
          const year = startMonth < 0 ? dayjs().utc().year() - 1 : dayjs().utc().year();
          const adjustedStartMonth = (startMonth + 12) % 12;
          const startDate = dayjs().utc().year(year).month(adjustedStartMonth).startOf("month");
          const endDate = startDate.add(2, "month").endOf("month");

          return `${startDate.format("YYYY-MM-DD")}|${endDate.format("YYYY-MM-DD")}`;
        })()
      }
    ],
    []
  );

  // Load statuses and task types from the API into the Estado / Tipo de tarea branches
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusesData, taskTypesData] = await Promise.all([getTasksStatus(), getTaskTypes()]);

        const statuses = statusesData.map((status: ITaskStatus) => ({
          value: String(status.id),
          label: status.name
        }));

        const taskTypes = taskTypesData.map((type: ITaskTypes) => ({
          value: String(type.ID),
          label: type.NAME
        }));

        setOptionsList((prev) =>
          prev.map((option) => {
            if (option.value === "statuses") return { ...option, children: statuses };
            if (option.value === "taskTypes") return { ...option, children: taskTypes };
            return option;
          })
        );
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchData();
  }, []);

  // Reflect selected cascader values back into the parent's filters
  useEffect(() => {
    const newFilters: ISelectFilterTasks = {
      statuses: [],
      taskTypes: [],
      dates: []
    };

    selectedValues.forEach((path) => {
      const category = path[0];
      const id = path[path.length - 1];

      switch (category) {
        case "statuses":
          newFilters.statuses.push(id);
          break;
        case "taskTypes":
          newFilters.taskTypes.push(Number(id));
          break;
        case "Fechas":
          newFilters.dates.push(id);
          break;
      }
    });

    setSelectedFilters(newFilters);
  }, [selectedValues, setSelectedFilters]);

  // Inject / select the custom date range as a tag when chosen from the modal
  useEffect(() => {
    if (customDate) {
      const [start, end] = customDate.split("|");
      const formattedLabel = `${dayjs(start).format("DD/MM/YYYY")} - ${dayjs(end).format("DD/MM/YYYY")}`;

      setSelectedValues((prev) => {
        const filtered = prev.filter((item) => item[0] !== "Fechas");
        return [...filtered, ["Fechas", customDate]];
      });

      setOptionsList((prev) =>
        prev.map((option) => {
          if (option.value === "Fechas") {
            if (option.children?.some((child) => child.value === customDate)) {
              return option;
            }
            return {
              ...option,
              children: [
                ...(option.children || []),
                {
                  label: formattedLabel,
                  value: customDate,
                  isLeaf: true
                }
              ]
            };
          }
          return option;
        })
      );
    }
  }, [customDate]);

  const loadData = async (selectedOptions: FilterOption[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];

    setOpenOption(targetOption.value);

    if (targetOption.value === "Fechas") {
      targetOption.children = dates.map((date) => ({
        label: date.label,
        value: date.value
      }));

      setOptionsList([...optionsList]);
    }
  };

  const onChange = (newValue: string[][]) => {
    if (newValue.length === 0) {
      setSelectedValues([]);
      return;
    }

    const latest = newValue.at(-1);
    if (!latest) {
      setSelectedValues([]);
      return;
    }

    // Fechas is single-select: replace any previous date selection with the latest.
    // Estado / Tipo de tarea keep multiple selections.
    if (latest[0] === "Fechas") {
      const withoutDates = newValue.filter((item) => item[0] !== "Fechas");
      setSelectedValues([...withoutDates, latest]);
      return;
    }

    setSelectedValues(newValue);
  };

  return (
    <Cascader
      dropdownRender={(menu) => {
        return (
          <div>
            {menu}
            {openOption === "Fechas" && handleOpenCustomDate && (
              <div
                style={{
                  padding: "8px",
                  paddingTop: "0px",
                  textAlign: "right",
                  marginRight: "0.5rem"
                }}
              >
                <p
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={handleOpenCustomDate}
                >
                  Fecha personalizada
                </p>
              </div>
            )}
          </div>
        );
      }}
      className="filterCascader"
      popupClassName="filterActivePaymentsTab"
      style={{ width: "180px", height: "48px" }}
      size="large"
      multiple
      maxTagCount="responsive"
      placeholder="Filtrar"
      placement="bottomLeft"
      showCheckedStrategy={Cascader.SHOW_CHILD}
      loadData={loadData}
      value={selectedValues}
      onChange={onChange}
      options={optionsList}
      onClear={() => {
        setSelectedValues([]);
        setSelectedFilters({ statuses: [], taskTypes: [], dates: [] });
        setCustomDate("");
      }}
      dropdownStyle={{
        zIndex: openOption === "Fechas" && handleOpenCustomDate ? 999 : 1000
      }}
    />
  );
}

const initialOptions: FilterOption[] = [
  {
    value: "Fechas",
    label: "Fechas",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "statuses",
    label: "Estado",
    isLeaf: false
  },
  {
    value: "taskTypes",
    label: "Tipo de tarea",
    isLeaf: false
  }
];
