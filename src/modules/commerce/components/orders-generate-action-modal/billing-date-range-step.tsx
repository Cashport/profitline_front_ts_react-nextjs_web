import { useState } from "react";
import { Button, DatePicker, Typography } from "antd";
import { CaretLeft, DownloadSimple } from "@phosphor-icons/react";
import dayjs, { Dayjs } from "dayjs";

const { Text } = Typography;

type PresetKey = "today" | "last7" | "thisMonth" | "lastMonth";

const PRESETS: { key: PresetKey; label: string; range: () => [Dayjs, Dayjs] }[] = [
  { key: "today", label: "Hoy", range: () => [dayjs().startOf("day"), dayjs().startOf("day")] },
  {
    key: "last7",
    label: "Últimos 7 días",
    range: () => [dayjs().subtract(6, "day").startOf("day"), dayjs().startOf("day")]
  },
  {
    key: "thisMonth",
    label: "Este mes",
    range: () => [dayjs().startOf("month"), dayjs().startOf("day")]
  },
  {
    key: "lastMonth",
    label: "Mes anterior",
    range: () => [
      dayjs().subtract(1, "month").startOf("month"),
      dayjs().subtract(1, "month").endOf("month").startOf("day")
    ]
  }
];

interface Props {
  title: string;
  loading?: boolean;
  onBack: () => void;
  onConfirm: (startDate: string, endDate: string) => void;
}

export const BillingDateRangeStep = ({ title, loading, onBack, onConfirm }: Props) => {
  const [preset, setPreset] = useState<PresetKey | null>("thisMonth");
  const [from, setFrom] = useState<Dayjs | null>(() => PRESETS[2].range()[0]);
  const [to, setTo] = useState<Dayjs | null>(() => PRESETS[2].range()[1]);

  const isInvalid = !from || !to || from.isAfter(to, "day");
  const days = isInvalid ? 0 : to.diff(from, "day") + 1;

  const handlePreset = (key: PresetKey) => {
    const [start, end] = PRESETS.find((p) => p.key === key)!.range();
    setPreset(key);
    setFrom(start);
    setTo(end);
  };

  const handleConfirm = () => {
    if (isInvalid) return;
    onConfirm(from.format("YYYY-MM-DD"), to.format("YYYY-MM-DD"));
  };

  return (
    <div className="billingDateRangeStep">
      <button type="button" className="billingDateRangeStep__back" onClick={onBack}>
        <CaretLeft size={14} />
        <span>{title}</span>
      </button>

      <p className="billingDateRangeStep__description">Selecciona el rango de fechas del informe</p>

      <div className="billingDateRangeStep__presets">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`billingDateRangeStep__preset${
              preset === p.key ? " billingDateRangeStep__preset--active" : ""
            }`}
            onClick={() => handlePreset(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="billingDateRangeStep__fields">
        <label className="billingDateRangeStep__field">
          <span>Desde</span>
          <DatePicker
            value={from}
            format="DD/MM/YYYY"
            allowClear={false}
            disabledDate={(d) => (to ? d.isAfter(to, "day") : false)}
            onChange={(d) => {
              setFrom(d);
              setPreset(null);
            }}
          />
        </label>
        <label className="billingDateRangeStep__field">
          <span>Hasta</span>
          <DatePicker
            value={to}
            format="DD/MM/YYYY"
            allowClear={false}
            disabledDate={(d) => (from ? d.isBefore(from, "day") : false)}
            onChange={(d) => {
              setTo(d);
              setPreset(null);
            }}
          />
        </label>
      </div>

      <Text
        className={`billingDateRangeStep__hint${
          isInvalid ? " billingDateRangeStep__hint--error" : ""
        }`}
      >
        {isInvalid
          ? "La fecha inicial debe ser anterior a la final"
          : `${from.format("DD/MM/YYYY")} – ${to.format("DD/MM/YYYY")} · ${days} ${
              days === 1 ? "día" : "días"
            }`}
      </Text>

      <div className="billingDateRangeStep__footer">
        <Button className="billingDateRangeStep__cancel" onClick={onBack}>
          Cancelar
        </Button>
        <Button
          className="billingDateRangeStep__confirm"
          icon={<DownloadSimple size={14} />}
          onClick={handleConfirm}
          disabled={isInvalid}
          loading={loading}
        >
          Descargar
        </Button>
      </div>
    </div>
  );
};
