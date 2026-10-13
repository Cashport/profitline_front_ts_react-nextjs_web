"use client";

import { DatePicker } from "antd";
import esES from "antd/es/date-picker/locale/es_ES";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/es";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { fmtDayLabel } from "../../utils/visits-format";

interface VisitsDateNavProps {
  day: Dayjs;
  today: Dayjs;
  onChange: (day: Dayjs) => void;
}

const STEP_CLASS =
  "flex w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";

/**
 * antd trae su propia copia de dayjs (sin los plugins del proyecto), así que sus fechas
 * no son el `Dayjs` de aquí: se pasan a la copia del proyecto por su timestamp.
 */
const fromPicker = (value: { valueOf(): number }) => dayjs(value.valueOf()).startOf("day");

/**
 * Día que se mira: flechas de a un día y la etiqueta abre un calendario para saltar
 * a cualquier fecha (el pie del calendario trae "Hoy").
 */
export default function VisitsDateNav({ day, today, onChange }: VisitsDateNavProps) {
  return (
    <div className="flex h-12 items-stretch overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        aria-label="Día anterior"
        className={STEP_CLASS}
        onClick={() => onChange(day.subtract(1, "day"))}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1 border-x border-border pl-3 transition-colors hover:bg-secondary">
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <DatePicker
          value={day}
          onChange={(value) => value && onChange(fromPicker(value))}
          format={(value) => fmtDayLabel(fromPicker(value), today)}
          locale={esES}
          allowClear={false}
          inputReadOnly
          variant="borderless"
          suffixIcon={null}
          aria-label="Elegir día"
          className="w-[156px] [&_input]:!cursor-pointer [&_input]:!text-[12.5px] [&_input]:!font-medium"
        />
      </div>

      <button
        type="button"
        aria-label="Día siguiente"
        className={STEP_CLASS}
        onClick={() => onChange(day.add(1, "day"))}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
