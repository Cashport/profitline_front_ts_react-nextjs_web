"use client";

import { useEffect, useState } from "react";
import { Button, Drawer, Input, Select } from "antd";

import { useMessageApi } from "@/context/MessageContext";
import {
  deleteSupportTag,
  getSupportDataSourceValues,
  saveSupportTag,
  type SupportTagInput
} from "@/services/support/support";
import type { ISupportConfig, ISupportTagConfig } from "@/types/support/ISupport";
import { cn } from "@/utils/utils";
import { useSupportDark } from "../../containers/support-layout/support-layout";
import { DrawerLabel } from "./rule-editor";

interface Draft extends SupportTagInput {
  manualText: string;
}

const fromTag = (t: ISupportTagConfig | null): Draft => ({
  name: t?.name ?? "",
  source: t?.source ?? "MANUAL",
  source_key: t?.source_key ?? null,
  is_required: t?.is_required ?? false,
  applies_to_all: t?.applies_to_all ?? true,
  route_by_value: t?.route_by_value ?? false,
  is_active: t?.is_active ?? true,
  category_ids: t?.category_ids ?? [],
  values: (t?.values ?? []).map((v) => ({ value: v.value, owner_user_id: v.owner_user_id })),
  manualText: t?.source === "MANUAL" ? (t?.values ?? []).map((v) => v.value).join("\n") : ""
});

const Radio = ({ on }: { on: boolean }) => (
  <span
    className={cn(
      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px]",
      on ? "border-cp-ink" : "border-[#c4c4c4]"
    )}
  >
    {on && <span className="h-2 w-2 rounded-full bg-cp-ink" />}
  </span>
);

/** Campo extra del formulario: lista propia o un dato de Cashport; opcionalmente enruta por valor. */
export default function TagDrawer({
  open,
  tag,
  config,
  onClose,
  onSaved
}: {
  open: boolean;
  tag: ISupportTagConfig | null;
  config: ISupportConfig;
  onClose: () => void;
  onSaved: (next: ISupportConfig) => void;
}) {
  const { showMessage } = useMessageApi();
  const dark = useSupportDark();
  const [d, setD] = useState<Draft>(fromTag(tag));
  const [dataValues, setDataValues] = useState<string[]>([]);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setD(fromTag(tag));
      setTried(false);
    }
  }, [open, tag]);

  useEffect(() => {
    if (d.source === "DATA" && d.source_key) {
      getSupportDataSourceValues(d.source_key)
        .then(setDataValues)
        .catch(() => setDataValues([]));
    }
  }, [d.source, d.source_key]);

  const manualValues = Array.from(
    new Set(
      d.manualText
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean)
    )
  );
  const values = d.source === "MANUAL" ? manualValues : dataValues;
  const ownerOf = (value: string) => d.values.find((v) => v.value === value)?.owner_user_id ?? null;
  const enabledCats = config.categories.filter((c) => c.enabled);

  const errors = {
    name: !d.name.trim(),
    source: d.source === "DATA" && !d.source_key,
    manual: d.source === "MANUAL" && manualValues.length < 2,
    scope: !d.applies_to_all && !d.category_ids.length
  };

  const save = async () => {
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    setBusy(true);
    try {
      const body: SupportTagInput = {
        ...d,
        name: d.name.trim(),
        values:
          d.source === "MANUAL"
            ? manualValues.map((value) => ({
                value,
                owner_user_id: d.route_by_value ? ownerOf(value) : null
              }))
            : d.route_by_value
              ? d.values.filter((v) => v.owner_user_id)
              : []
      };
      const next = await saveSupportTag(tag?.id ?? null, body);
      onSaved(next);
      showMessage("success", "Tag guardado");
      onClose();
    } catch (error) {
      showMessage("error", (error as Error).message || "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!tag) return;
    setBusy(true);
    try {
      onSaved(await deleteSupportTag(tag.id));
      showMessage("success", "Tag eliminado");
      onClose();
    } catch (error) {
      showMessage("error", (error as Error).message || "No se pudo eliminar");
    } finally {
      setBusy(false);
    }
  };

  const setOwner = (value: string, owner: number | null) => {
    const rest = d.values.filter((v) => v.value !== value);
    setD({ ...d, values: owner ? [...rest, { value, owner_user_id: owner }] : rest });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="min(480px, 100%)"
      rootClassName={dark ? "dark" : undefined}
      title={
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-normal text-cp-ink-3">Tags del formulario</span>
          <span className="text-[15px] font-semibold">{tag ? "Editar tag" : "Nuevo tag"}</span>
        </div>
      }
      footer={
        <div className="flex items-center gap-2">
          {tag && (
            <Button type="text" danger disabled={busy} onClick={remove}>
              Eliminar tag
            </Button>
          )}
          <div className="flex-1" />
          <Button type="text" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="primary" className="!text-[#141414]" loading={busy} onClick={save}>
            Guardar
          </Button>
        </div>
      }
    >
      <div className="wallet-scope flex flex-col gap-5 text-cp-ink">
        <label className="flex flex-col gap-1.5">
          <DrawerLabel hint="Así lo verá el usuario en el formulario.">Nombre visible</DrawerLabel>
          <Input
            maxLength={80}
            value={d.name}
            placeholder="Ej. País"
            status={tried && errors.name ? "error" : undefined}
            onChange={(e) => setD({ ...d, name: e.target.value })}
          />
        </label>

        <div className="flex flex-col gap-2">
          <DrawerLabel>Origen de los valores</DrawerLabel>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2">
            {(
              [
                [
                  "DATA",
                  "Dato de Cashport",
                  "Los valores salen de las tablas y se actualizan solos."
                ],
                ["MANUAL", "Lista propia", "Escribes los valores a mano."]
              ] as const
            ).map(([k, l, h]) => (
              <button
                key={k}
                type="button"
                onClick={() =>
                  setD({
                    ...d,
                    source: k,
                    source_key: k === "DATA" ? config.data_sources[0]?.key ?? null : null
                  })
                }
                className={cn(
                  "flex cursor-pointer gap-2.5 rounded-[10px] border bg-cp-surface p-3 text-left",
                  d.source === k ? "border-cp-ink" : "border-cp-line-2"
                )}
              >
                <Radio on={d.source === k} />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-semibold">{l}</span>
                  <span className="text-[13px] text-cp-ink-3">{h}</span>
                </span>
              </button>
            ))}
          </div>
          {d.source === "DATA" ? (
            <>
              <Select
                value={d.source_key ?? undefined}
                placeholder="Elige el dato"
                status={tried && errors.source ? "error" : undefined}
                options={config.data_sources.map((s) => ({ value: s.key, label: s.label }))}
                onChange={(v: string) => setD({ ...d, source_key: v })}
              />
              {dataValues.length > 0 && (
                <div className="flex flex-wrap gap-1 rounded-[10px] bg-cp-bg p-2.5">
                  {dataValues.slice(0, 12).map((v) => (
                    <span key={v} className="rounded-md bg-cp-surface px-2 py-0.5 text-[13px]">
                      {v}
                    </span>
                  ))}
                  {dataValues.length > 12 && (
                    <span className="px-1 text-[13px] text-cp-ink-3">
                      +{dataValues.length - 12}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <label className="flex flex-col gap-1">
              <span className="text-[13px] text-cp-ink-2">Valores · uno por línea</span>
              <Input.TextArea
                rows={5}
                value={d.manualText}
                status={tried && errors.manual ? "error" : undefined}
                placeholder={"Dermocosmética\nPrescripción\nEstética"}
                onChange={(e) => setD({ ...d, manualText: e.target.value })}
              />
              {tried && errors.manual && (
                <span className="text-[13px] text-cp-red">Agrega al menos 2 valores</span>
              )}
            </label>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <DrawerLabel>Aplica a</DrawerLabel>
          <div className="flex flex-wrap gap-4">
            {(
              [
                [true, "Todas las categorías"],
                [false, "Solo algunas"]
              ] as const
            ).map(([all, l]) => (
              <button
                key={l}
                type="button"
                onClick={() => setD({ ...d, applies_to_all: all })}
                className="flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[13px] text-cp-ink"
              >
                <Radio on={d.applies_to_all === all} />
                {l}
              </button>
            ))}
          </div>
          {!d.applies_to_all && (
            <div className="flex flex-wrap gap-1.5">
              {enabledCats.map((c) => {
                const id = c.project_category_id!;
                const on = d.category_ids.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      setD({
                        ...d,
                        category_ids: on
                          ? d.category_ids.filter((x) => x !== id)
                          : [...d.category_ids, id]
                      })
                    }
                    className={cn(
                      "h-8 cursor-pointer whitespace-nowrap rounded-lg border px-2.5 text-[13px]",
                      on
                        ? "border-cp-ink bg-cp-ink text-cp-surface"
                        : "border-cp-line-2 bg-cp-surface text-cp-ink"
                    )}
                  >
                    {c.name}
                  </button>
                );
              })}
              {tried && errors.scope && (
                <span className="w-full text-[13px] text-cp-red">Elige al menos una categoría</span>
              )}
            </div>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={d.is_required}
            onChange={(e) => setD({ ...d, is_required: e.target.checked })}
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-[13px] font-semibold">Obligatorio</span>
            <span className="text-[13px] text-cp-ink-3">
              El usuario no puede enviar sin elegir un valor.
            </span>
          </span>
        </label>

        <div className="flex flex-col gap-2.5">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={d.route_by_value}
              onChange={(e) => setD({ ...d, route_by_value: e.target.checked })}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold">Asignar responsable según el valor</span>
              <span className="text-[13px] text-cp-ink-3">
                Ej. los tickets de Perú van a otra persona. Los valores sin asignar usan el
                responsable de la subcategoría.
              </span>
            </span>
          </label>
          {d.route_by_value && values.length > 0 && (
            <div className="flex max-h-[280px] flex-col overflow-y-auto rounded-[10px] border border-cp-line">
              {values.map((v) => (
                <div
                  key={v}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-center gap-2.5 border-b border-cp-muted px-2.5 py-1.5"
                >
                  <span className="truncate text-[13px]">{v}</span>
                  <Select
                    size="small"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="Responsable de la subcategoría"
                    value={ownerOf(v) ?? undefined}
                    options={config.users.map((u) => ({ value: u.id, label: u.name }))}
                    onChange={(o?: number) => setOwner(v, o ?? null)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
