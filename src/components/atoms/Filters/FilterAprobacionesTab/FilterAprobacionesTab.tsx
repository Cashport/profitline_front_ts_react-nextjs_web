import { useState } from "react";
import dayjs from "dayjs";
import { Cascader, DatePicker, Modal } from "antd";
import type { Dayjs } from "dayjs";

import "../filterCascader.scss";

// Simplified date filter for the Aprobaciones tab. The endpoint only accepts a
// single `from` date (YYYY-MM-DD), so the Cascader exposes date presets that
// resolve to that single value — same UI pattern as FilterPaymentApplicationsTab
// but without the range plumbing. The "Personalizado" footer opens a modal with
// a DatePicker so the user can pick any arbitrary day.
export interface IProfit360ApprovalsFilters {
  from?: string;
}

interface Props {
  selectedFilters: IProfit360ApprovalsFilters;
  setSelectedFilters: (next: IProfit360ApprovalsFilters) => void;
}

const DATE_PRESETS: { label: string; from: string }[] = [
  { label: "Hoy", from: dayjs().format("YYYY-MM-DD") },
  { label: "Ayer", from: dayjs().subtract(1, "day").format("YYYY-MM-DD") },
  { label: "Últimos 3 días", from: dayjs().subtract(3, "day").format("YYYY-MM-DD") },
  { label: "Últimos 7 días", from: dayjs().subtract(7, "day").format("YYYY-MM-DD") },
  { label: "Últimos 15 días", from: dayjs().subtract(15, "day").format("YYYY-MM-DD") },
  { label: "Últimos 30 días", from: dayjs().subtract(30, "day").format("YYYY-MM-DD") }
];

export const FilterAprobacionesTab = ({ selectedFilters, setSelectedFilters }: Props) => {
  const [customOpen, setCustomOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState<Dayjs | null>(() =>
    selectedFilters.from ? dayjs(selectedFilters.from) : null
  );

  const options = DATE_PRESETS.map((preset) => ({
    value: preset.from,
    label: preset.label
  }));

  const value = selectedFilters.from ? ["Fecha", selectedFilters.from] : [];

  return (
    <>
      <Cascader
        className="filterCascader"
        popupClassName="filterPaymentApplicationsTab"
        style={{ width: 200, fontSize: 14, fontWeight: 400 }}
        placeholder="Filtrar por fecha"
        placement="bottomLeft"
        expandTrigger="hover"
        value={value}
        options={[{ value: "Fecha", label: "Fecha", isLeaf: false, children: options }]}
        dropdownRender={(menu) => (
          <div>
            {menu}
            <div
              style={{
                padding: "8px",
                paddingTop: "0px",
                textAlign: "right",
                marginRight: "0.5rem"
              }}
            >
              <p
                style={{ textDecoration: "underline", cursor: "pointer", margin: 0 }}
                onClick={() => setCustomOpen(true)}
              >
                Fecha personalizada
              </p>
            </div>
          </div>
        )}
        onChange={(newValue) => {
          const latest = newValue.at(-1);
          if (!latest) {
            setSelectedFilters({});
            return;
          }
          setSelectedFilters({ from: latest[1] });
        }}
      />

      <Modal
        title="Seleccionar fecha"
        open={customOpen}
        onCancel={() => setCustomOpen(false)}
        onOk={() => {
          if (!pickedDate) return;
          setSelectedFilters({ from: pickedDate.format("YYYY-MM-DD") });
          setCustomOpen(false);
        }}
        okButtonProps={{ disabled: !pickedDate }}
        okText="Aplicar"
        cancelText="Cancelar"
        destroyOnClose
      >
        <DatePicker
          value={pickedDate}
          onChange={(d) => setPickedDate(d)}
          format="YYYY-MM-DD"
          allowClear={false}
          style={{ width: "100%" }}
          placeholder="Selecciona una fecha"
        />
      </Modal>
    </>
  );
};
