"use client";

import { useState } from "react";
import useSWR from "swr";
import { ChevronRight, Database, List, Pencil } from "lucide-react";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { MiniSwitch } from "@/components/ui/page-header-controls/page-header-controls";
import SupportSkeleton from "../../components/support-skeleton/support-skeleton";
import { useMessageApi } from "@/context/MessageContext";
import {
  getSupportConfig,
  saveSupportCategory,
  saveSupportSubcategory
} from "@/services/support/support";
import type {
  ISupportCategoryConfig,
  ISupportConfig,
  ISupportSubcategoryConfig,
  ISupportTagConfig
} from "@/types/support/ISupport";
import { cn } from "@/utils/utils";
import CategoryDrawer, { type RuleTarget } from "../../components/config/category-drawer";
import { slaText } from "../../components/config/rule-editor";
import SettingsPanel from "../../components/config/settings-panel";
import TagDrawer from "../../components/config/tag-drawer";
import { CriticalityTag } from "../../components/support-tags/support-tags";
import { useProjectId } from "../../hooks/use-support-access";

type Tab = "categories" | "tags" | "general";

const CAT_COLS = "24px minmax(0,2.2fr) 110px minmax(0,1fr) minmax(0,1.3fr) 120px 40px";
const TAG_COLS = "minmax(0,1.3fr) minmax(0,1.2fr) minmax(0,1.6fr) minmax(0,1.3fr) 100px 110px 40px";

const EditButton = ({ onClick, title }: { onClick: () => void; title: string }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center justify-self-end rounded-[7px] border border-cp-line-2 bg-transparent text-cp-ink hover:border-cp-ink"
  >
    <Pencil className="h-3.5 w-3.5" />
  </button>
);

/** /support/config: categorías (módulos) y subcategorías del proyecto, tags y datos generales. */
export default function SupportConfigView() {
  const projectId = useProjectId();
  const { showMessage } = useMessageApi();
  const { data, error, mutate } = useSWR(
    projectId ? ["support-config", projectId] : null,
    getSupportConfig,
    { revalidateOnFocus: false }
  );
  const [tab, setTab] = useState<Tab | null>(null);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [rule, setRule] = useState<RuleTarget | null>(null);
  const [tagDrawer, setTagDrawer] = useState<{ tag: ISupportTagConfig | null } | null>(null);
  const [showUnused, setShowUnused] = useState(false);

  const saved = (next: ISupportConfig) => mutate(next, false);
  const activeTab: Tab = tab ?? (data && !data.settings ? "general" : "categories");

  const toggleCategory = async (c: ISupportCategoryConfig) => {
    if (!c.enabled) {
      setRule({ kind: "category", category: c });
      return;
    }
    try {
      saved(
        await saveSupportCategory(c.category_id, {
          criticality: c.criticality,
          sla_attention_min: c.sla_attention_min,
          sla_resolution_min: c.sla_resolution_min,
          owner_user_id: c.owner_user_id,
          is_active: !c.is_active
        })
      );
    } catch (e) {
      showMessage("error", (e as Error).message || "No se pudo guardar");
    }
  };

  const toggleSub = async (s: ISupportSubcategoryConfig) => {
    try {
      saved(
        await saveSupportSubcategory(s.id, {
          name: s.name,
          criticality: s.criticality,
          sla_attention_min: s.sla_attention_min,
          sla_resolution_min: s.sla_resolution_min,
          owner_user_id: s.owner_user_id,
          is_active: !s.is_active
        })
      );
    } catch (e) {
      showMessage("error", (e as Error).message || "No se pudo guardar");
    }
  };

  const tabs: [Tab, string][] = [
    ["categories", "Categorías"],
    ["tags", "Tags"],
    ["general", "Responsable y horario"]
  ];

  const categories = (data?.categories ?? []).filter((c) => showUnused || c.enabled);

  return (
    <ViewWrapper headerTitle="Configuración de soporte" headerBack="/support">
      <div className="cp-page min-w-0 pb-6">
        <div className="cp-card flex min-w-0 flex-col px-[18px] pb-[18px] pt-1">
          <div className="flex min-h-[48px] flex-wrap items-end gap-x-[22px] border-b border-cp-line">
            {tabs.map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={cn(
                  "-mb-px cursor-pointer border-0 border-b-2 bg-transparent px-0 pb-2.5 text-[13.5px]",
                  activeTab === k
                    ? "border-cp-ink font-semibold text-cp-ink"
                    : "border-transparent font-medium text-cp-ink-4"
                )}
              >
                {l}
              </button>
            ))}
            <div className="flex-1" />
            {activeTab === "tags" && data && (
              <button
                type="button"
                onClick={() => setTagDrawer({ tag: null })}
                className="mb-2 h-9 cursor-pointer rounded-lg border-0 bg-cp-lime px-3.5 text-[13px] font-semibold text-[#141414] hover:bg-cp-lime-dark"
              >
                + Nuevo tag
              </button>
            )}
            {activeTab === "categories" && data && (
              <div className="mb-2.5">
                <MiniSwitch
                  checked={showUnused}
                  onChange={setShowUnused}
                  label={<span className="text-[13px] text-cp-ink-2">Ver módulos sin usar</span>}
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            {!data ? (
              error ? (
                <p className="text-[13px] text-cp-magenta">
                  {(error as Error).message || "No tienes permiso para configurar el soporte."}
                </p>
              ) : (
                <SupportSkeleton rows={6} />
              )
            ) : activeTab === "general" ? (
              <SettingsPanel config={data} onSaved={saved} />
            ) : activeTab === "categories" ? (
              <div className="flex min-w-0 flex-col">
                {!data.settings && (
                  <div className="mb-3 rounded-[10px] bg-cp-bg px-3.5 py-2.5 text-[13px] text-cp-ink-2">
                    Primero define el responsable general en «Responsable y horario».
                  </div>
                )}
                <div
                  className="grid h-[43px] items-center gap-3 border-b border-cp-line px-2.5 text-[13px] font-semibold"
                  style={{ gridTemplateColumns: CAT_COLS }}
                >
                  <span />
                  <span>Categoría / subcategoría</span>
                  <span>Criticidad</span>
                  <span>ANS</span>
                  <span>Responsable</span>
                  <span>Estado</span>
                  <span />
                </div>
                {categories.length === 0 && (
                  <div className="flex flex-col items-start gap-2 px-1 py-8">
                    <span className="text-[14px] font-semibold">Aún no hay categorías activas</span>
                    <span className="text-[13px] text-cp-ink-3">
                      Activa los módulos que usa este proyecto (Cartera, Marketplace…) con su
                      criticidad, ANS y responsable. Mientras no exista ninguna, los usuarios no
                      verán la opción de soporte.
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowUnused(true)}
                      className="mt-1 h-9 cursor-pointer rounded-lg border-0 bg-cp-lime px-3.5 text-[13px] font-semibold text-[#141414]"
                    >
                      Ver módulos disponibles
                    </button>
                  </div>
                )}
                {categories.map((c) => {
                  const expanded = c.enabled && (open[c.category_id] ?? true);
                  return (
                    <div key={c.category_id} className="flex flex-col border-b border-cp-line">
                      <div
                        className={cn(
                          "grid min-h-[48px] items-center gap-3 px-2.5 text-[13px]",
                          c.enabled && !c.is_active && "opacity-50"
                        )}
                        style={{ gridTemplateColumns: CAT_COLS }}
                      >
                        <button
                          type="button"
                          disabled={!c.enabled}
                          onClick={() => setOpen({ ...open, [c.category_id]: !expanded })}
                          className="flex cursor-pointer items-center border-0 bg-transparent p-0 text-cp-ink disabled:invisible"
                        >
                          <ChevronRight
                            className={cn("h-4 w-4 transition-transform", expanded && "rotate-90")}
                          />
                        </button>
                        <span className="flex min-w-0 items-baseline gap-2">
                          <b className="truncate font-semibold">{c.name}</b>
                          {c.enabled && (
                            <span className="whitespace-nowrap text-cp-ink-3">
                              {c.subcategories.length}{" "}
                              {c.subcategories.length === 1 ? "subcategoría" : "subcategorías"}
                            </span>
                          )}
                        </span>
                        <span>
                          {c.criticality ? <CriticalityTag value={c.criticality} /> : "—"}
                        </span>
                        <span className="font-semibold">
                          {slaText(c.sla_attention_min, c.sla_resolution_min)}
                        </span>
                        <span className="truncate">
                          {c.enabled
                            ? c.owner_name ?? (
                                <span className="text-cp-ink-3">
                                  {data.settings?.owner_name ?? "General"}
                                </span>
                              )
                            : "—"}
                        </span>
                        <span>
                          {c.enabled ? (
                            <MiniSwitch
                              checked={c.is_active}
                              onChange={() => toggleCategory(c)}
                              label={
                                <span className="text-[13px] text-cp-ink-2">
                                  {c.is_active ? "Activa" : "Inactiva"}
                                </span>
                              }
                            />
                          ) : (
                            <button
                              type="button"
                              disabled={!data.settings}
                              onClick={() => setRule({ kind: "category", category: c })}
                              className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-medium text-cp-blue disabled:cursor-default disabled:text-cp-ink-4"
                            >
                              Activar
                            </button>
                          )}
                        </span>
                        {c.enabled ? (
                          <EditButton
                            title="Editar categoría"
                            onClick={() => setRule({ kind: "category", category: c })}
                          />
                        ) : (
                          <span />
                        )}
                      </div>
                      {expanded && (
                        <div className="flex flex-col pb-1.5">
                          {c.subcategories.map((s) => (
                            <div
                              key={s.id}
                              className={cn(
                                "grid min-h-[44px] items-center gap-3 border-t border-cp-muted px-2.5 text-[13px]",
                                !s.is_active && "opacity-50"
                              )}
                              style={{ gridTemplateColumns: CAT_COLS }}
                            >
                              <span />
                              <span className="truncate pl-3.5">{s.name}</span>
                              <span>
                                <CriticalityTag
                                  value={s.effective.criticality}
                                  inherited={s.effective.criticality_inherited}
                                />
                              </span>
                              <span
                                className={cn(
                                  s.effective.sla_inherited ? "text-cp-ink-3" : "font-semibold"
                                )}
                              >
                                {slaText(
                                  s.effective.sla_attention_min,
                                  s.effective.sla_resolution_min
                                )}
                              </span>
                              <span
                                className={cn(
                                  "truncate",
                                  s.effective.owner_inherited && "text-cp-ink-3"
                                )}
                              >
                                {s.effective.owner_name ?? data.settings?.owner_name ?? "General"}
                              </span>
                              <span>
                                <MiniSwitch
                                  checked={s.is_active}
                                  onChange={() => toggleSub(s)}
                                  label={
                                    <span className="text-[13px] text-cp-ink-2">
                                      {s.is_active ? "Activa" : "Inactiva"}
                                    </span>
                                  }
                                />
                              </span>
                              <EditButton
                                title="Editar subcategoría"
                                onClick={() =>
                                  setRule({ kind: "subcategory", category: c, sub: s })
                                }
                              />
                            </div>
                          ))}
                          <div className="px-2.5 py-1.5 pl-[50px]">
                            <button
                              type="button"
                              onClick={() =>
                                setRule({ kind: "subcategory", category: c, sub: null })
                              }
                              className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-medium text-cp-blue"
                            >
                              + Agregar subcategoría
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <span className="px-2.5 pt-3 text-[13px] text-cp-ink-3">
                  Los valores en gris se heredan de la categoría. ANS «15 min / 2 h» = primera
                  atención / solución, en horas hábiles.
                </span>
              </div>
            ) : (
              <div className="flex min-w-0 flex-col gap-3">
                <span className="max-w-[680px] text-[13px] leading-relaxed text-cp-ink-2">
                  Campos extra que el usuario completa al crear un ticket cuando la categoría no
                  basta para encauzarlo. Los valores salen de un dato de Cashport (ej. País) o de
                  una lista propia.
                </span>
                {data.tags.length === 0 ? (
                  <div className="flex flex-col items-start gap-2 py-5">
                    <span className="text-[14px] font-semibold">Este proyecto no usa tags</span>
                    <span className="text-[13px] text-cp-ink-3">
                      El formulario solo pedirá categoría y subcategoría.
                    </span>
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-col">
                    <div
                      className="grid h-[43px] items-center gap-3 border-b border-cp-line px-2.5 text-[13px] font-semibold"
                      style={{ gridTemplateColumns: TAG_COLS }}
                    >
                      <span>Tag</span>
                      <span>Origen</span>
                      <span>Valores</span>
                      <span>Aplica a</span>
                      <span>Uso</span>
                      <span>Estado</span>
                      <span />
                    </div>
                    {data.tags.map((t) => {
                      const source =
                        t.source === "DATA"
                          ? data.data_sources.find((s) => s.key === t.source_key)?.label ??
                            t.source_key
                          : "Lista propia";
                      const routed = t.route_by_value
                        ? t.values.filter((v) => v.owner_user_id).length
                        : 0;
                      return (
                        <div
                          key={t.id}
                          className="grid min-h-[52px] items-center gap-3 border-b border-cp-line px-2.5 py-1.5 text-[13px]"
                          style={{ gridTemplateColumns: TAG_COLS }}
                        >
                          <span className="flex min-w-0 flex-col">
                            <b className="truncate font-semibold">{t.name}</b>
                            {routed > 0 && (
                              <span className="text-cp-blue">
                                Asigna responsable en {routed} {routed === 1 ? "valor" : "valores"}
                              </span>
                            )}
                          </span>
                          <span className="flex min-w-0 items-center gap-1.5">
                            {t.source === "DATA" ? (
                              <Database className="h-3.5 w-3.5 shrink-0" />
                            ) : (
                              <List className="h-3.5 w-3.5 shrink-0" />
                            )}
                            <span className="truncate">{source}</span>
                          </span>
                          <span className="flex min-w-0 flex-wrap gap-1">
                            {t.source === "MANUAL" ? (
                              t.values.slice(0, 3).map((v) => (
                                <span key={v.value} className="rounded-md bg-cp-muted px-2 py-0.5">
                                  {v.value}
                                </span>
                              ))
                            ) : (
                              <span className="text-cp-ink-3">Según la tabla</span>
                            )}
                            {t.source === "MANUAL" && t.values.length > 3 && (
                              <span className="text-cp-ink-3">+{t.values.length - 3}</span>
                            )}
                          </span>
                          <span className="truncate">
                            {t.applies_to_all
                              ? "Todas las categorías"
                              : data.categories
                                  .filter(
                                    (c) =>
                                      c.project_category_id &&
                                      t.category_ids.includes(c.project_category_id)
                                  )
                                  .map((c) => c.name)
                                  .join(", ")}
                          </span>
                          <span className={t.is_required ? "font-semibold" : "text-cp-ink-3"}>
                            {t.is_required ? "Obligatorio" : "Opcional"}
                          </span>
                          <span className={t.is_active ? "" : "text-cp-ink-3"}>
                            {t.is_active ? "Activo" : "Inactivo"}
                          </span>
                          <EditButton title="Editar tag" onClick={() => setTagDrawer({ tag: t })} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {data && (
        <>
          <CategoryDrawer
            target={rule}
            config={data}
            onClose={() => setRule(null)}
            onSaved={saved}
          />
          <TagDrawer
            open={!!tagDrawer}
            tag={tagDrawer?.tag ?? null}
            config={data}
            onClose={() => setTagDrawer(null)}
            onSaved={saved}
          />
        </>
      )}
    </ViewWrapper>
  );
}
