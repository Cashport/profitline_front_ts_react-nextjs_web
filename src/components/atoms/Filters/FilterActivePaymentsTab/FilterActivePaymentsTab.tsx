import { Dispatch, SetStateAction, useEffect, useMemo, useState, ReactNode } from "react";
import dayjs from "dayjs";
import { Cascader } from "antd";

import "../filterCascader.scss";

interface Option {
  value: string;
  label: string | ReactNode;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  children?: Option[];
}

export interface IActivePaymentsFilters {
  dates?: string[];
  active?: string[];
}

interface Props {
  setSelectedFilters: Dispatch<SetStateAction<IActivePaymentsFilters>>;
  handleOpenCustomDate?: () => void;
}

export const FilterActivePaymentsTab = ({ setSelectedFilters, handleOpenCustomDate }: Props) => {
  const [optionsList, setOptionsList] = useState<Option[]>(initialOptions);
  const [selectedValues, setSelectedValues] = useState<string[][]>([]);
  const [openOption, setOpenOption] = useState<string | null>(null);

  useEffect(() => {
    if (selectedValues.length === 0) {
      return setSelectedFilters({
        dates: [],
        active: []
      });
    }
    const datesFilters = selectedValues
      .filter((item) => item[0] === "Fechas")
      .map((item) => item[1]);
    const activeFilters = selectedValues
      .filter((item) => item[0] === "Activo")
      .map((item) => item[1]);
    setSelectedFilters({
      dates: datesFilters,
      active: activeFilters
    });
  }, [selectedValues, setSelectedFilters]);

  const loadData = async (selectedOptions: Option[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];

    setOpenOption(targetOption.value); // we check which option is open

    if (targetOption.value === "Fechas") {
      targetOption.children = [
        ...dates.map((date) => ({
          label: date.label,
          value: date.value
        }))
      ];

      setOptionsList([...optionsList]);
    }

    if (targetOption.value === "Activo") {
      targetOption.children = [
        {
          label: "Si",
          value: "1"
        },
        {
          label: "No",
          value: "0"
        }
      ];

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
    const category = latest[0];
    const cleaned = newValue.filter((item) => item[0] !== category);
    setSelectedValues([...cleaned, latest]);
  };

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

  return (
    <Cascader
      dropdownMenuColumnStyle={{
        maxHeight: "calc(100vh - 200px)",
        backgroundColor: "blue"
      }}
      dropdownRender={(menu) => {
        return (
          <div>
            {menu}
            {openOption === "Fechas" && (
              <div style={{ padding: "8px", textAlign: "right", marginRight: "1.5rem" }}>
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
      style={{ width: "15rem", height: "48px" }}
      multiple
      size="large"
      removeIcon
      maxTagCount="responsive"
      placeholder="Filtrar"
      placement="bottomLeft"
      changeOnSelect
      onClear={() =>
        setSelectedFilters({
          dates: [],
          active: []
        })
      }
      loadData={loadData}
      value={selectedValues}
      onChange={onChange}
      options={optionsList}
      dropdownStyle={{
        zIndex: openOption === "Fechas" && handleOpenCustomDate ? 999 : 1000
      }}
    />
  );
};

const initialOptions: Option[] = [
  {
    value: "Fechas",
    label: "Fechas",
    isLeaf: false,
    disableCheckbox: true
  },
  {
    value: "Activo",
    label: "Activo",
    isLeaf: false,
    disableCheckbox: true
  }
];
