"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, Select, Spin } from "antd";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import SearchField from "@/components/ui/search-field/search-field";
import { MiniSwitch } from "@/components/ui/page-header-controls/page-header-controls";
import { useMessageApi } from "@/context/MessageContext";
import { ApiError } from "@/utils/api/api";
import { getRoleDetail, saveRole } from "@/services/roles/rolesAdmin";
import {
  useAdminRoles,
  useRoleDetail,
  useRolesCatalog
} from "@/modules/platform/hooks/useRolesAdmin";
import { getRoleGroup, ROLE_GROUPS } from "@/modules/platform/lib/roleGroups";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  EndpointLine,
  EndpointStats,
  Notice,
  PaneItem,
  SystemBadge,
  filterCatalog,
  INCLUDE_OTHER_HINT
} from "@/modules/platform/components/shared/shared";

export const NEW_ROLE = "new" as const;
export type RoleSelection = number | typeof NEW_ROLE | null;

const ROL_NAME_MAX = 20;

const sameIds = (a: Set<number>, b: Set<number>) =>
  a.size === b.size && Array.from(a).every((id) => b.has(id));

interface Props {
  selection: RoleSelection;
  onSelect: (selection: RoleSelection) => void;
  onOpenRole: (rolId: number) => void;
}

export default function RolesTab({ selection, onSelect, onOpenRole }: Props) {
  const { showMessage } = useMessageApi();
  const {
    roles,
    mutate: mutateRoles,
    isLoading: loadingRoles,
    error: rolesError
  } = useAdminRoles();
  const { catalog: fullCatalog, mutate: mutateCatalog } = useRolesCatalog();
  const editingId = typeof selection === "number" ? selection : null;
  const { detail, mutate: mutateDetail, isLoading: loadingDetail } = useRoleDetail(editingId);

  const [roleSearch, setRoleSearch] = useState("");
  const [name, setName] = useState("");
  const [draft, setDraft] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [onlySelected, setOnlySelected] = useState(false);
  const [showTms, setShowTms] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const catalog = useMemo(
    () => (fullCatalog ? filterCatalog(fullCatalog, showTms) : undefined),
    [fullCatalog, showTms]
  );

  const baselineIds = useMemo(
    () => new Set(selection === NEW_ROLE ? [] : detail?.component_ids ?? []),
    [detail, selection]
  );
  const baselineName = selection === NEW_ROLE ? "" : detail?.rol_name ?? "";

  useEffect(() => {
    setDraft(new Set(baselineIds));
    setName(baselineName);
    setShowTms(baselineName.toLowerCase().startsWith("tms-"));
    setExpanded(new Set());
  }, [baselineIds, baselineName]);

  const dirty =
    selection !== null && (name.trim() !== baselineName.trim() || !sameIds(draft, baselineIds));

  const confirmLeave = (action: () => void) => {
    if (!dirty) return action();
    Modal.confirm({
      title: "¿Descartar los cambios?",
      content: "Tienes cambios sin guardar en este rol.",
      okText: "Descartar",
      cancelText: "Seguir editando",
      onOk: action
    });
  };

  const groupedRoles = useMemo(() => {
    const term = roleSearch.trim().toLowerCase();
    const filtered = (roles ?? []).filter((r) => r.rol_name.toLowerCase().includes(term));
    return ROLE_GROUPS.map((group) => ({
      group,
      roles: filtered.filter((r) => getRoleGroup(r.rol_name) === group)
    })).filter((g) => g.roles.length > 0);
  }, [roles, roleSearch]);

  const visibleModules = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (catalog ?? [])
      .map((m) => ({
        ...m,
        components: m.components.filter((c) => {
          if (c.is_generic) return false;
          if (onlySelected && !draft.has(c.component_id)) return false;
          if (!term) return true;
          return (
            m.page_name.toLowerCase().includes(term) ||
            c.component_name.toLowerCase().includes(term) ||
            c.endpoints.some((e) => `/${e.route}${e.path}`.toLowerCase().includes(term))
          );
        })
      }))
      .filter((m) => m.components.length > 0);
  }, [catalog, search, onlySelected, showTms, draft]);

  const endpointCount = useMemo(
    () =>
      (catalog ?? [])
        .flatMap((m) => m.components)
        .filter((c) => draft.has(c.component_id))
        .reduce((total, c) => total + c.endpoints.length, 0),
    [catalog, draft]
  );

  const summary = roles?.find((r) => r.rol_id === editingId);
  const isSystem = selection !== NEW_ROLE && Boolean(detail?.is_system);

  const setComponents = (ids: number[], checked: boolean) =>
    setDraft((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });

  const toggleExpanded = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const copyFrom = async (rolId: number) => {
    try {
      const source = await getRoleDetail(rolId);
      setDraft(new Set(source.component_ids));
      showMessage("success", `Se copiaron las funcionalidades de ${source.rol_name}.`);
    } catch {
      showMessage("error", "No se pudo copiar el rol.");
    }
  };

  const save = async () => {
    const trimmed = name.trim().replace(/\s+/g, " ");
    if (!trimmed) {
      showMessage("warning", "Escribe un nombre para el rol.");
      return;
    }
    if (trimmed.length > ROL_NAME_MAX) {
      showMessage("warning", `El nombre admite máximo ${ROL_NAME_MAX} caracteres.`);
      return;
    }
    setSaving(true);
    try {
      const saved = await saveRole({
        rol_id: editingId ?? undefined,
        rol_name: trimmed,
        component_ids: Array.from(draft)
      });
      await Promise.all([mutateRoles(), mutateCatalog()]);
      if (editingId) {
        await mutateDetail({ status: 200, message: "", data: saved }, { revalidate: false });
        showMessage(
          "success",
          `Rol ${saved.rol_name} actualizado. Sus usuarios verán el cambio al volver a iniciar sesión.`
        );
      } else {
        onSelect(saved.rol_id);
        showMessage("success", `Rol ${saved.rol_name} creado.`);
      }
    } catch (e) {
      showMessage("error", (e as ApiError)?.message || "No se pudo guardar el rol.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cp-fill">
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] md:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="flex min-h-0 min-w-0 flex-col gap-3 border-cp-line pr-[18px] md:border-r">
          <div className="flex items-center gap-2">
            <SearchField
              value={roleSearch}
              onChange={setRoleSearch}
              placeholder="Buscar rol"
              className="flex-1"
            />
            <button
              type="button"
              className={BTN_PRIMARY}
              onClick={() => confirmLeave(() => onSelect(NEW_ROLE))}
            >
              <span className="flex items-center gap-1">
                <Plus size={16} aria-hidden /> Crear rol
              </span>
            </button>
          </div>
          <div className="cp-list-scroll">
            {rolesError && (
              <p className="px-3 py-2 text-[13px] text-cp-magenta">
                No se pudieron cargar los roles: {rolesError.message}
              </p>
            )}
            {loadingRoles && (
              <div className="flex justify-center py-6">
                <Spin />
              </div>
            )}
            {groupedRoles.map(({ group, roles: items }) => (
              <section key={group} className="mb-3">
                <p className="px-3 pb-1 text-[13px] font-semibold text-cp-ink-3">{group}</p>
                {items.map((role) => (
                  <PaneItem
                    key={role.rol_id}
                    active={role.rol_id === editingId}
                    onClick={() => confirmLeave(() => onSelect(role.rol_id))}
                    title={role.rol_name}
                    subtitle={`${role.components} func. · ${role.active_users} usuarios`}
                    badge={role.is_system ? <SystemBadge /> : undefined}
                  />
                ))}
              </section>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col gap-3 md:pl-[18px]">
          {selection === null && (
            <Notice>
              Elige un rol para ver y editar sus funcionalidades, o crea uno nuevo. Los roles son
              globales: un cambio aplica en todos los proyectos que lo tengan habilitado.
            </Notice>
          )}

          {selection !== null && (loadingDetail || !catalog) && (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          )}

          {selection !== null && catalog && (selection === NEW_ROLE || detail) && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={ROL_NAME_MAX}
                  disabled={isSystem}
                  placeholder="Nombre del rol"
                  aria-label="Nombre del rol"
                  title={
                    isSystem
                      ? "El código usa este rol por su nombre: no se puede renombrar"
                      : undefined
                  }
                  className="h-[var(--control-h)] min-w-[220px] flex-1 rounded-lg border border-cp-line-2 bg-cp-surface px-3 text-[14px] font-semibold text-cp-ink outline-none focus:border-cp-ink-4 disabled:bg-cp-bg"
                />
                <Select
                  placeholder="Copiar funcionalidades de…"
                  className="min-w-[230px]"
                  value={null}
                  showSearch
                  optionFilterProp="label"
                  options={(roles ?? [])
                    .filter((r) => r.rol_id !== editingId)
                    .map((r) => ({ value: r.rol_id, label: r.rol_name }))}
                  onChange={(value) => value && copyFrom(value)}
                />
                {editingId && (
                  <button
                    type="button"
                    className={BTN_SECONDARY}
                    onClick={() => onOpenRole(editingId)}
                  >
                    Ver resumen
                  </button>
                )}
                <button
                  type="button"
                  className={BTN_SECONDARY}
                  disabled={!dirty || saving}
                  onClick={() => {
                    setDraft(new Set(baselineIds));
                    setName(baselineName);
                  }}
                >
                  Descartar
                </button>
                <button
                  type="button"
                  className={BTN_PRIMARY}
                  disabled={(!dirty && selection !== NEW_ROLE) || saving}
                  onClick={save}
                >
                  {saving ? "Guardando…" : selection === NEW_ROLE ? "Crear rol" : "Guardar cambios"}
                </button>
              </div>

              <p className="text-[13px] text-cp-ink-3">
                {draft.size} funcionalidades · {endpointCount} endpoints
                {summary &&
                  ` · ${summary.active_users} usuarios activos en ${summary.projects} proyectos`}
                {dirty && " · cambios sin guardar"}
              </p>

              <Notice>
                Lo que está en &quot;Generico&quot; lo puede usar cualquier rol y no aparece aquí.
                Para controlarlo, muévelo a una funcionalidad en la pestaña Catálogo de endpoints.
              </Notice>

              <div className="flex flex-wrap items-center gap-4">
                <SearchField
                  value={search}
                  onChange={setSearch}
                  placeholder="Buscar funcionalidad o ruta"
                  className="min-w-[260px] flex-1"
                />
                <MiniSwitch
                  checked={onlySelected}
                  onChange={setOnlySelected}
                  label={<span className="text-[13px] text-cp-ink-2">Solo las que tiene</span>}
                />
                <MiniSwitch
                  checked={showTms}
                  onChange={setShowTms}
                  title={INCLUDE_OTHER_HINT}
                  label={<span className="text-[13px] text-cp-ink-2">Incluir TMS</span>}
                />
              </div>

              <div className="cp-list-scroll pr-1">
                {visibleModules.length === 0 && (
                  <p className="py-4 text-[13px] text-cp-ink-3">
                    No hay funcionalidades con ese filtro.
                  </p>
                )}
                {visibleModules.map((module) => {
                  const ids = module.components.map((c) => c.component_id);
                  const selected = ids.filter((id) => draft.has(id)).length;
                  return (
                    <section key={module.page_id} className="mb-4">
                      <label className="flex cursor-pointer items-center gap-3 border-b border-cp-line pb-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#cbe71e]"
                          checked={selected === ids.length}
                          ref={(el) => {
                            if (el) el.indeterminate = selected > 0 && selected < ids.length;
                          }}
                          onChange={(e) => setComponents(ids, e.target.checked)}
                        />
                        <span className="text-[13.5px] font-semibold text-cp-ink">
                          {module.page_name}
                        </span>
                        <span className="text-[13px] text-cp-ink-3">
                          {selected} de {ids.length}
                        </span>
                      </label>
                      {module.components.map((component) => {
                        const open = expanded.has(component.component_id);
                        const checked = draft.has(component.component_id);
                        const changed = checked !== baselineIds.has(component.component_id);
                        return (
                          <div key={component.component_id} className="border-b border-cp-muted">
                            <div className="grid min-h-[45px] grid-cols-[18px_18px_minmax(0,1fr)_auto] items-center gap-3 px-1">
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-[#cbe71e]"
                                checked={checked}
                                aria-label={component.component_name}
                                onChange={(e) =>
                                  setComponents([component.component_id], e.target.checked)
                                }
                              />
                              <button
                                type="button"
                                className="border-0 bg-transparent p-0 text-cp-ink-3 disabled:opacity-30"
                                disabled={component.endpoints.length === 0}
                                onClick={() => toggleExpanded(component.component_id)}
                                aria-label="Ver endpoints"
                              >
                                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                              <span className="truncate text-[13px] text-cp-ink">
                                {component.component_name}
                                {changed && (
                                  <span className="ml-2 rounded-[5px] bg-cp-muted px-1.5 py-px text-[13px] font-semibold text-cp-ink-2">
                                    Sin guardar
                                  </span>
                                )}
                              </span>
                              <EndpointStats component={component} />
                            </div>
                            {open && (
                              <div className="pb-2 pl-[52px]">
                                {component.endpoints.map((endpoint) => (
                                  <EndpointLine key={endpoint.endpoint_id} {...endpoint} />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </section>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
