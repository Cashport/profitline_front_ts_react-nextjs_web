"use client";

import { useEffect, useState } from "react";
import { Button, Drawer, Input, Select } from "antd";

import { useMessageApi } from "@/context/MessageContext";
import { saveSupportCategory, saveSupportSubcategory } from "@/services/support/support";
import type {
  ISupportCategoryConfig,
  ISupportConfig,
  ISupportSubcategoryConfig,
  SupportCriticality
} from "@/types/support/ISupport";
import { useSupportDark } from "../../containers/support-layout/support-layout";
import { CriticalityPicker, DrawerLabel, SlaEditor, slaText } from "./rule-editor";

export type RuleTarget =
  | { kind: "category"; category: ISupportCategoryConfig }
  | {
      kind: "subcategory";
      category: ISupportCategoryConfig;
      sub: ISupportSubcategoryConfig | null;
    };

interface Draft {
  name: string;
  criticality: SupportCriticality | null;
  attention: number | null;
  resolution: number | null;
  inheritSla: boolean;
  owner: number | null;
}

const fromTarget = (t: RuleTarget): Draft => {
  if (t.kind === "category") {
    const c = t.category;
    return {
      name: c.name,
      criticality: c.criticality ?? "MEDIUM",
      attention: c.sla_attention_min,
      resolution: c.sla_resolution_min ?? 480,
      inheritSla: false,
      owner: c.owner_user_id
    };
  }
  const s = t.sub;
  return {
    name: s?.name ?? "",
    criticality: s?.criticality ?? null,
    attention: s?.sla_attention_min ?? null,
    resolution: s?.sla_resolution_min ?? null,
    inheritSla: !s || s.sla_resolution_min == null,
    owner: s?.owner_user_id ?? null
  };
};

/** Panel lateral para la categoría del proyecto o una subcategoría (que hereda lo que deje vacío). */
export default function CategoryDrawer({
  target,
  config,
  onClose,
  onSaved
}: {
  target: RuleTarget | null;
  config: ISupportConfig;
  onClose: () => void;
  onSaved: (next: ISupportConfig) => void;
}) {
  const { showMessage } = useMessageApi();
  const dark = useSupportDark();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(target ? fromTarget(target) : null);
    setTried(false);
  }, [target]);

  if (!target || !draft) return <Drawer open={false} />;

  const isSub = target.kind === "subcategory";
  const cat = target.category;
  const owners = config.users.map((u) => ({ value: u.id, label: u.name }));
  const ownerFallback = isSub
    ? cat.owner_name ?? config.settings?.owner_name ?? "Responsable general"
    : config.settings?.owner_name ?? "Responsable general";

  const save = async () => {
    setTried(true);
    if (isSub && !draft.name.trim()) return;
    if (!draft.inheritSla && draft.resolution == null) return;
    setBusy(true);
    try {
      const sla = draft.inheritSla
        ? { sla_attention_min: null, sla_resolution_min: null }
        : { sla_attention_min: draft.attention, sla_resolution_min: draft.resolution };
      const next = isSub
        ? await saveSupportSubcategory(target.sub?.id ?? null, {
            name: draft.name.trim(),
            project_category_id: cat.project_category_id ?? undefined,
            criticality: draft.criticality,
            ...sla,
            owner_user_id: draft.owner,
            is_active: target.sub?.is_active ?? true
          })
        : await saveSupportCategory(cat.category_id, {
            criticality: draft.criticality,
            ...sla,
            owner_user_id: draft.owner,
            is_active: cat.enabled ? cat.is_active : true
          });
      onSaved(next);
      showMessage("success", isSub ? "Subcategoría guardada" : "Categoría guardada");
      onClose();
    } catch (error) {
      showMessage("error", (error as Error).message || "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open
      onClose={onClose}
      width="min(460px, 100%)"
      rootClassName={dark ? "dark" : undefined}
      title={
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-normal text-cp-ink-3">
            {isSub ? `${cat.name} · subcategoría` : "Categoría"}
          </span>
          <span className="text-[15px] font-semibold">
            {isSub ? (target.sub ? "Editar subcategoría" : "Nueva subcategoría") : cat.name}
          </span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
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
        {isSub && (
          <label className="flex flex-col gap-1.5">
            <DrawerLabel>Nombre</DrawerLabel>
            <Input
              maxLength={120}
              value={draft.name}
              status={tried && !draft.name.trim() ? "error" : undefined}
              placeholder="Ej. Creación de cliente"
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            {tried && !draft.name.trim() && (
              <span className="text-[13px] text-cp-red">El nombre es obligatorio</span>
            )}
          </label>
        )}

        <div className="flex flex-col gap-1.5">
          <DrawerLabel>Criticidad</DrawerLabel>
          <CriticalityPicker
            value={draft.criticality}
            allowInherit={isSub}
            inheritedValue={cat.criticality}
            onChange={(v) => setDraft({ ...draft, criticality: v })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <DrawerLabel>ANS</DrawerLabel>
            {isSub && (
              <label className="flex cursor-pointer items-center gap-1.5 text-[13px] text-cp-ink-2">
                <input
                  type="checkbox"
                  checked={draft.inheritSla}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      inheritSla: e.target.checked,
                      resolution: e.target.checked ? null : cat.sla_resolution_min,
                      attention: e.target.checked ? null : cat.sla_attention_min
                    })
                  }
                />
                Heredar ({slaText(cat.sla_attention_min, cat.sla_resolution_min)})
              </label>
            )}
          </div>
          {!draft.inheritSla && (
            <SlaEditor
              attention={draft.attention}
              resolution={draft.resolution}
              showErrors={tried}
              onChange={({ attention, resolution }) =>
                setDraft({ ...draft, attention, resolution })
              }
            />
          )}
        </div>

        <label className="flex flex-col gap-1.5">
          <DrawerLabel hint={`Si lo dejas vacío, el ticket va a ${ownerFallback}.`}>
            Responsable
          </DrawerLabel>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={
              isSub ? `Heredar (${cat.owner_name ?? ownerFallback})` : "Sin responsable propio"
            }
            value={draft.owner ?? undefined}
            options={owners}
            onChange={(v?: number) => setDraft({ ...draft, owner: v ?? null })}
          />
        </label>
      </div>
    </Drawer>
  );
}
