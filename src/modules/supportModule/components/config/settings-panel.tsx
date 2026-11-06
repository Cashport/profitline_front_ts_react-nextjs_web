"use client";

import { useEffect, useState } from "react";
import { Button, Select } from "antd";

import { useMessageApi } from "@/context/MessageContext";
import { saveSupportSettings } from "@/services/support/support";
import type { ISupportBusinessHour, ISupportConfig } from "@/types/support/ISupport";
import { WEEKDAYS } from "../../utils/support-format";
import { DrawerLabel } from "./rule-editor";

const TIMEZONES = [
  { value: "America/Bogota", label: "Bogotá, Lima, Quito (UTC-5)" },
  { value: "America/Mexico_City", label: "Ciudad de México (UTC-6)" },
  { value: "America/Guatemala", label: "Centroamérica (UTC-6)" },
  { value: "America/Santiago", label: "Santiago" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (UTC-3)" }
];

type Day = { on: boolean; start: string; end: string };

const toDays = (hours: ISupportBusinessHour[]): Day[] =>
  WEEKDAYS.map((_, i) => {
    const h = hours.find((x) => x.weekday === i + 1);
    return h
      ? { on: true, start: h.start_time, end: h.end_time === "23:59" ? "24:00" : h.end_time }
      : { on: false, start: "08:00", end: "18:00" };
  });

const PRESETS: { label: string; days: Day[] }[] = [
  {
    label: "Lunes a viernes 8:00–18:00",
    days: WEEKDAYS.map((_, i) => ({ on: i < 5, start: "08:00", end: "18:00" }))
  },
  {
    label: "Todos los días 6:00–21:00",
    days: WEEKDAYS.map(() => ({ on: true, start: "06:00", end: "21:00" }))
  },
  { label: "24/7", days: WEEKDAYS.map(() => ({ on: true, start: "00:00", end: "24:00" })) }
];

/** Responsable general (obligatorio: recibe todo lo que no tenga dueño) y horario hábil del proyecto. */
export default function SettingsPanel({
  config,
  onSaved
}: {
  config: ISupportConfig;
  onSaved: (next: ISupportConfig) => void;
}) {
  const { showMessage } = useMessageApi();
  const [owner, setOwner] = useState<number | null>(config.settings?.owner_user_id ?? null);
  const [agents, setAgents] = useState<number[]>(config.agents.map((a) => a.id));
  const [timezone, setTimezone] = useState(config.settings?.timezone ?? "America/Bogota");
  const [holidays, setHolidays] = useState(config.settings?.use_holidays ?? true);
  const [days, setDays] = useState<Day[]>(toDays(config.business_hours));
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setOwner(config.settings?.owner_user_id ?? null);
    setAgents(config.agents.map((a) => a.id));
    setTimezone(config.settings?.timezone ?? "America/Bogota");
    setHolidays(config.settings?.use_holidays ?? true);
    setDays(toDays(config.business_hours));
  }, [config]);

  const badDay = days.findIndex((d) => d.on && d.end <= d.start);
  const noDays = !days.some((d) => d.on);

  const save = async () => {
    setTried(true);
    if (!owner || badDay >= 0 || noDays) return;
    setBusy(true);
    try {
      const next = await saveSupportSettings({
        owner_user_id: owner,
        agent_user_ids: agents,
        timezone,
        use_holidays: holidays,
        business_hours: days
          .map((d, i) => ({ weekday: i + 1, start_time: d.start, end_time: d.end, on: d.on }))
          .filter((d) => d.on)
          .map(({ weekday, start_time, end_time }) => ({ weekday, start_time, end_time }))
      });
      onSaved(next);
      showMessage("success", "Configuración guardada");
    } catch (error) {
      showMessage("error", (error as Error).message || "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };

  const setDay = (i: number, patch: Partial<Day>) =>
    setDays(days.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  return (
    <div className="flex max-w-[640px] flex-col gap-6 py-2">
      {!config.settings && (
        <div className="rounded-[10px] bg-cp-bg px-3.5 py-2.5 text-[13px] text-cp-ink-2">
          Para activar el soporte en este proyecto, define el responsable general y guarda. Después
          activa las categorías y crea sus subcategorías.
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <DrawerLabel hint="Recibe los tickets de las subcategorías sin responsable propio.">
          Responsable general del proyecto
        </DrawerLabel>
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="Elige una persona"
          value={owner ?? undefined}
          status={tried && !owner ? "error" : undefined}
          options={config.users.map((u) => ({ value: u.id, label: u.name }))}
          onChange={(v: number) => setOwner(v)}
        />
        {tried && !owner && (
          <span className="text-[13px] text-cp-red">Elige el responsable general</span>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <DrawerLabel hint="Ven y atienden todos los tickets del proyecto. Los demás usuarios solo crean solicitudes y siguen las suyas.">
          Solucionadores de tickets
        </DrawerLabel>
        <Select
          mode="multiple"
          showSearch
          optionFilterProp="label"
          placeholder="Elige las personas que resuelven tickets"
          value={agents}
          options={config.users.map((u) => ({ value: u.id, label: u.name }))}
          onChange={(v: number[]) => setAgents(v)}
        />
      </label>

      <div className="flex flex-col gap-2.5">
        <DrawerLabel hint="Los ANS solo corren dentro de este horario.">
          Horario de atención
        </DrawerLabel>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setDays(p.days)}
              className="h-8 cursor-pointer rounded-lg border border-cp-line-2 bg-cp-surface px-2.5 text-[13px] text-cp-ink hover:border-cp-ink"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col rounded-[10px] border border-cp-line">
          {days.map((d, i) => (
            <div
              key={WEEKDAYS[i]}
              className="flex flex-wrap items-center gap-3 border-b border-cp-muted px-3 py-2 text-[13px] last:border-0"
            >
              <label className="flex w-[120px] cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={d.on}
                  onChange={(e) => setDay(i, { on: e.target.checked })}
                />
                {WEEKDAYS[i]}
              </label>
              {d.on ? (
                <span className="flex items-center gap-2">
                  <input
                    type="time"
                    value={d.start}
                    onChange={(e) => setDay(i, { start: e.target.value })}
                    className="h-8 rounded-lg border border-cp-line-2 bg-cp-surface px-2 text-[13px] text-cp-ink"
                  />
                  a
                  <Select
                    size="middle"
                    className="w-[100px]"
                    value={d.end}
                    onChange={(v: string) => setDay(i, { end: v })}
                    options={[
                      ...Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`)
                        .slice(1)
                        .map((v) => ({ value: v, label: v })),
                      { value: "24:00", label: "24:00" }
                    ]}
                  />
                  {tried && badDay === i && (
                    <span className="text-cp-red">El cierre debe ser después del inicio</span>
                  )}
                </span>
              ) : (
                <span className="text-cp-ink-3">Sin atención</span>
              )}
            </div>
          ))}
        </div>
        {tried && noDays && <span className="text-[13px] text-cp-red">Activa al menos un día</span>}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-[13px]">
            Zona horaria
            <Select
              className="w-[260px]"
              value={timezone}
              onChange={setTimezone}
              options={TIMEZONES}
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={holidays}
              onChange={(e) => setHolidays(e.target.checked)}
            />
            Descontar festivos
          </label>
        </div>
      </div>

      <div>
        <Button type="primary" className="!text-[#141414]" loading={busy} onClick={save}>
          Guardar
        </Button>
      </div>
    </div>
  );
}
