"use client";

import { useMemo, useState } from "react";
import { Modal, Select, Spin } from "antd";
import { Lock, Plus } from "lucide-react";
import SearchField from "@/components/ui/search-field/search-field";
import { MiniSwitch } from "@/components/ui/page-header-controls/page-header-controls";
import { useMessageApi } from "@/context/MessageContext";
import { ApiError } from "@/utils/api/api";
import { createComponent, moveEndpoint } from "@/services/roles/rolesAdmin";
import { useRolesCatalog } from "@/modules/platform/hooks/useRolesAdmin";
import { ICatalogComponent, ICatalogEndpoint, ICatalogModule } from "@/types/roles/IRolesAdmin";
import {
  BTN_PRIMARY,
  EndpointStats,
  MethodTag,
  Notice,
  PaneItem
} from "@/modules/platform/components/shared/shared";

const LOCKED_ROUTE = "role";

type Located = { module: ICatalogModule; component: ICatalogComponent };

export default function CatalogTab() {
  const { showMessage } = useMessageApi();
  const { catalog, isLoading, mutate, error } = useRolesCatalog();

  const [search, setSearch] = useState("");
  const [showTms, setShowTms] = useState(false);
  const [onlyWrites, setOnlyWrites] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [newPageId, setNewPageId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");

  const modules = useMemo(
    () => (catalog ?? []).filter((m) => showTms || m.product !== "TMS"),
    [catalog, showTms]
  );

  const index = useMemo(() => {
    const map = new Map<number, Located>();
    (catalog ?? []).forEach((module) =>
      module.components.forEach((component) =>
        map.set(component.component_id, { module, component })
      )
    );
    return map;
  }, [catalog]);

  const genericFirst = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items = modules.flatMap((module) =>
      module.components
        .filter(
          (c) =>
            !term ||
            module.page_name.toLowerCase().includes(term) ||
            c.component_name.toLowerCase().includes(term) ||
            c.endpoints.some((e) => `/${e.route}${e.path}`.toLowerCase().includes(term))
        )
        .map((component) => ({ module, component }))
    );
    return [
      ...items.filter((i) => i.component.is_generic),
      ...items.filter((i) => !i.component.is_generic)
    ];
  }, [modules, search]);

  const selected = selectedId ? index.get(selectedId) : genericFirst[0];

  const endpoints = useMemo(() => {
    if (!selected) return [];
    const term = search.trim().toLowerCase();
    const matchesComponent =
      !term ||
      selected.module.page_name.toLowerCase().includes(term) ||
      selected.component.component_name.toLowerCase().includes(term);
    return selected.component.endpoints.filter(
      (e) =>
        (!onlyWrites || e.method !== "GET") &&
        (matchesComponent || `/${e.route}${e.path}`.toLowerCase().includes(term))
    );
  }, [selected, onlyWrites, search]);

  const targetOptions = useMemo(
    () =>
      modules
        .filter((m) => m.components.length > 0)
        .map((m) => ({
          label: m.page_name,
          options: m.components.map((c) => ({
            value: c.component_id,
            label: `${m.page_name} · ${c.component_name}`
          }))
        })),
    [modules]
  );

  const askMove = (endpoint: ICatalogEndpoint, targetId: number) => {
    const from = selected?.component;
    const target = index.get(targetId);
    if (!from || !target) return;
    const toLabel = `${target.module.page_name} · ${target.component.component_name}`;
    Modal.confirm({
      title: `¿Mover ${endpoint.method} /${endpoint.route}${endpoint.path}?`,
      width: 560,
      content: (
        <div className="flex flex-col gap-2 text-[15px]">
          <p>
            Pasa de <b>{from.component_name}</b> a <b>{toLabel}</b>.
          </p>
          <p>
            Solo lo podrán usar los roles que tengan {target.component.component_name} (
            {target.component.roles_with_access}). Los que solo tenían {from.component_name} lo
            pierden. Aplica en máximo un minuto.
          </p>
          {target.component.roles_with_access === 0 && !target.component.is_generic && (
            <p className="font-semibold text-cp-magenta">
              Ningún rol tiene esta funcionalidad: nadie podrá usar el endpoint hasta que se la
              asignes a un rol.
            </p>
          )}
        </div>
      ),
      okText: "Mover",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await moveEndpoint(endpoint.endpoint_id, targetId);
          await mutate();
          showMessage("success", `Endpoint movido a ${toLabel}.`);
        } catch (e) {
          showMessage("error", (e as ApiError)?.message || "No se pudo mover el endpoint.");
        }
      }
    });
  };

  const submitNewComponent = async () => {
    if (!newPageId || !newName.trim()) {
      showMessage("warning", "Elige el módulo y escribe el nombre de la funcionalidad.");
      return;
    }
    try {
      const { component_id } = await createComponent(newPageId, newName.trim());
      await mutate();
      setSelectedId(component_id);
      setCreating(false);
      setNewName("");
      showMessage(
        "success",
        "Funcionalidad creada. Mueve aquí sus endpoints y asígnala a los roles que la necesiten."
      );
    } catch (e) {
      showMessage("error", (e as ApiError)?.message || "No se pudo crear la funcionalidad.");
    }
  };

  return (
    <div className="cp-fill">
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] md:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="flex min-h-0 min-w-0 flex-col gap-3 border-cp-line pr-[18px] md:border-r">
          <div className="flex items-center gap-2">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Buscar funcionalidad o endpoint"
              className="flex-1"
            />
            <button type="button" className={BTN_PRIMARY} onClick={() => setCreating(true)}>
              <span className="flex items-center gap-1">
                <Plus size={16} aria-hidden /> Nueva
              </span>
            </button>
          </div>
          <MiniSwitch
            checked={showTms}
            onChange={setShowTms}
            label={<span className="text-[15px] text-cp-ink-2">Mostrar TMS</span>}
          />
          <div className="cp-list-scroll">
            {error && (
              <p className="px-3 py-2 text-[15px] text-cp-magenta">
                No se pudo cargar el catálogo: {error.message}
              </p>
            )}
            {isLoading && (
              <div className="flex justify-center py-6">
                <Spin />
              </div>
            )}
            {genericFirst.map(({ module, component }) => (
              <PaneItem
                key={component.component_id}
                active={component.component_id === selected?.component.component_id}
                onClick={() => setSelectedId(component.component_id)}
                title={
                  component.is_generic
                    ? `${component.component_name} (sin control de rol)`
                    : component.component_name
                }
                subtitle={
                  <>
                    {module.page_name} · {component.endpoints.length} endpoints ·{" "}
                    {component.is_generic
                      ? "todos los roles"
                      : `${component.roles_with_access} roles`}
                  </>
                }
              />
            ))}
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col gap-3 md:pl-[18px]">
          {!selected && !isLoading && <Notice>Elige una funcionalidad.</Notice>}
          {selected && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[18px] font-semibold text-cp-ink">
                    {selected.module.page_name} · {selected.component.component_name}
                  </p>
                  <p className="text-[15px] text-cp-ink-3">
                    {selected.component.is_generic
                      ? "Cualquier rol puede usar estos endpoints"
                      : `${selected.component.roles_with_access} roles tienen acceso`}{" "}
                    · <EndpointStats component={selected.component} />
                  </p>
                </div>
                <MiniSwitch
                  checked={onlyWrites}
                  onChange={setOnlyWrites}
                  label={<span className="text-[15px] text-cp-ink-2">Solo escrituras</span>}
                />
              </div>

              {selected.component.is_generic && (
                <Notice tone="warning">
                  Estos endpoints no tienen control de rol. Mueve a una funcionalidad real los que
                  no deban estar abiertos a todos, sobre todo las escrituras.
                </Notice>
              )}

              <div className="cp-list-scroll pr-1">
                {endpoints.length === 0 && (
                  <p className="py-4 text-[15px] text-cp-ink-3">No hay endpoints con ese filtro.</p>
                )}
                {endpoints.map((endpoint) => {
                  const locked = endpoint.route.toLowerCase() === LOCKED_ROUTE;
                  return (
                    <div
                      key={endpoint.endpoint_id}
                      className="grid min-h-[45px] grid-cols-[64px_minmax(0,1fr)_260px] items-center gap-3 border-b border-cp-muted"
                    >
                      <MethodTag method={endpoint.method} />
                      <span
                        className="truncate font-mono text-[14px] text-cp-ink-2"
                        title={`/${endpoint.route}${endpoint.path}`}
                      >
                        /{endpoint.route}
                        {endpoint.path}
                      </span>
                      {locked ? (
                        <span
                          className="flex items-center gap-1 text-[14px] text-cp-ink-3"
                          title="Si se mueve, se perdería el acceso a esta consola"
                        >
                          <Lock size={14} aria-hidden /> Bloqueado
                        </span>
                      ) : (
                        <Select
                          placeholder="Mover a…"
                          value={null}
                          showSearch
                          optionFilterProp="label"
                          options={targetOptions}
                          onChange={(value) => value && askMove(endpoint, value)}
                          popupMatchSelectWidth={360}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        open={creating}
        title="Nueva funcionalidad"
        onCancel={() => setCreating(false)}
        onOk={submitNewComponent}
        okText="Crear"
        cancelText="Cancelar"
      >
        <div className="flex flex-col gap-3">
          <p className="text-[15px] text-cp-ink-2">
            Úsala para separar endpoints que necesitan un permiso propio. Después mueve aquí esos
            endpoints y asígnala en la pestaña Roles.
          </p>
          <Select
            placeholder="Módulo"
            value={newPageId}
            onChange={setNewPageId}
            showSearch
            optionFilterProp="label"
            options={(catalog ?? []).map((m) => ({ value: m.page_id, label: m.page_name }))}
          />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre, por ejemplo Reversar pagos"
            maxLength={255}
            className="h-[var(--control-h)] rounded-lg border border-cp-line-2 bg-[#fafafa] px-3 text-[15px] outline-none focus:border-cp-ink-4"
          />
        </div>
      </Modal>
    </div>
  );
}
