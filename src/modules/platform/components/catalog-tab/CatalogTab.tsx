"use client";

import { useMemo, useState } from "react";
import { Dropdown, Modal, Select, Spin } from "antd";
import { ChevronDown, Lock, Plus } from "lucide-react";
import SearchField from "@/components/ui/search-field/search-field";
import { MiniSwitch } from "@/components/ui/page-header-controls/page-header-controls";
import { useMessageApi } from "@/context/MessageContext";
import { ApiError } from "@/utils/api/api";
import { createComponent, moveEndpoint, registerEndpoint } from "@/services/roles/rolesAdmin";
import { useRolesCatalog, useUnregisteredRoutes } from "@/modules/platform/hooks/useRolesAdmin";
import { matchesRoutePattern, parseEndpointInput } from "@/modules/platform/lib/endpointInput";
import {
  ICatalogComponent,
  ICatalogEndpoint,
  ICatalogModule,
  IUnregisteredRoute
} from "@/types/roles/IRolesAdmin";
import {
  BTN_PRIMARY,
  EndpointStats,
  MethodTag,
  Notice,
  PaneItem,
  filterCatalog,
  INCLUDE_OTHER_HINT
} from "@/modules/platform/components/shared/shared";

const LOCKED_ROUTE = "role";
const UNREGISTERED = "unregistered" as const;
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

type Located = { module: ICatalogModule; component: ICatalogComponent };

export default function CatalogTab() {
  const { showMessage } = useMessageApi();
  const { catalog, isLoading, mutate, error } = useRolesCatalog();
  const {
    routes: unregistered,
    mutate: mutateUnregistered,
    error: unregisteredError
  } = useUnregisteredRoutes();

  const [search, setSearch] = useState("");
  const [showTms, setShowTms] = useState(false);
  const [onlyWrites, setOnlyWrites] = useState(false);
  const [selectedId, setSelectedId] = useState<number | typeof UNREGISTERED | null>(null);
  const [creating, setCreating] = useState(false);
  const [newPageId, setNewPageId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [registering, setRegistering] = useState(false);
  const [regMethod, setRegMethod] = useState("GET");
  const [regUrl, setRegUrl] = useState("");
  const [regComponentId, setRegComponentId] = useState<number | null>(null);

  const modules = useMemo(() => filterCatalog(catalog ?? [], showTms), [catalog, showTms]);

  const index = useMemo(() => {
    const map = new Map<number, Located>();
    (catalog ?? []).forEach((module) =>
      module.components.forEach((component) =>
        map.set(component.component_id, { module, component })
      )
    );
    return map;
  }, [catalog]);

  const term = search.trim().toLowerCase();

  const genericFirst = useMemo(() => {
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
  }, [modules, term]);

  const unregisteredVisible = useMemo(
    () =>
      (unregistered ?? []).filter(
        (r) =>
          (!onlyWrites || r.method !== "GET") &&
          (!term || `/${r.route}${r.path}`.toLowerCase().includes(term))
      ),
    [unregistered, onlyWrites, term]
  );

  const showingUnregistered =
    selectedId === UNREGISTERED || (selectedId === null && (unregistered?.length ?? 0) > 0);
  const selected =
    typeof selectedId === "number"
      ? index.get(selectedId)
      : showingUnregistered
        ? undefined
        : genericFirst[0];

  const endpoints = useMemo(() => {
    if (!selected) return [];
    const matchesComponent =
      !term ||
      selected.module.page_name.toLowerCase().includes(term) ||
      selected.component.component_name.toLowerCase().includes(term);
    return selected.component.endpoints.filter(
      (e) =>
        (!onlyWrites || e.method !== "GET") &&
        (matchesComponent || `/${e.route}${e.path}`.toLowerCase().includes(term))
    );
  }, [selected, onlyWrites, term]);

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

  const componentLabel = (componentId: number) => {
    const target = index.get(componentId);
    return target ? `${target.module.page_name} · ${target.component.component_name}` : "";
  };

  const accessNote = (componentId: number) => {
    const target = index.get(componentId)?.component;
    if (!target) return null;
    if (target.is_generic) {
      return <p>Quedará abierto a cualquier rol.</p>;
    }
    return (
      <>
        <p>
          Lo podrán usar los roles que tengan {target.component_name} ({target.roles_with_access}).
          Aplica en máximo un minuto.
        </p>
        {target.roles_with_access === 0 && (
          <p className="font-semibold text-cp-magenta">
            Ningún rol tiene esta funcionalidad: nadie podrá usar el endpoint hasta que se la
            asignes a un rol.
          </p>
        )}
      </>
    );
  };

  const refresh = () => Promise.all([mutate(), mutateUnregistered()]);

  const askMove = (endpoint: ICatalogEndpoint, targetId: number) => {
    const from = selected?.component;
    if (!from || !index.get(targetId)) return;
    const toLabel = componentLabel(targetId);
    Modal.confirm({
      title: `¿Mover ${endpoint.method} /${endpoint.route}${endpoint.path}?`,
      width: 560,
      content: (
        <div className="flex flex-col gap-2 text-[13px]">
          <p>
            Pasa de <b>{from.component_name}</b> a <b>{toLabel}</b>. Los roles que solo tenían{" "}
            {from.component_name} lo pierden.
          </p>
          {accessNote(targetId)}
        </div>
      ),
      okText: "Mover",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await moveEndpoint(endpoint.endpoint_id, targetId);
          await refresh();
          showMessage("success", `Endpoint movido a ${toLabel}.`);
        } catch (e) {
          showMessage("error", (e as ApiError)?.message || "No se pudo mover el endpoint.");
        }
      }
    });
  };

  const doRegister = async (
    input: { route: string; method: string; path: string },
    componentId: number
  ) => {
    try {
      const saved = await registerEndpoint({ ...input, component_id: componentId });
      await refresh();
      showMessage(
        "success",
        `${saved.method} /${saved.route}${saved.path} registrado en ${componentLabel(componentId)}.`
      );
      return true;
    } catch (e) {
      showMessage("error", (e as ApiError)?.message || "No se pudo registrar el endpoint.");
      return false;
    }
  };

  const askRegister = (route: IUnregisteredRoute, componentId: number) => {
    Modal.confirm({
      title: `¿Registrar ${route.method} /${route.route}${route.path}?`,
      width: 560,
      content: (
        <div className="flex flex-col gap-2 text-[13px]">
          <p>
            Queda en <b>{componentLabel(componentId)}</b>.
          </p>
          {accessNote(componentId)}
        </div>
      ),
      okText: "Registrar",
      cancelText: "Cancelar",
      onOk: () => doRegister(route, componentId)
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

  const parsed = parseEndpointInput(regUrl);
  const detected = useMemo(() => {
    if (!parsed) return null;
    const sameRoute = (route: string) => route.toLowerCase() === parsed.route.toLowerCase();
    const missing = (unregistered ?? []).find(
      (r) =>
        sameRoute(r.route) && r.method === regMethod && matchesRoutePattern(r.path, parsed.path)
    );
    if (missing) return { kind: "missing" as const, route: missing };
    for (const mod of catalog ?? []) {
      for (const component of mod.components) {
        const hit = component.endpoints.find(
          (e) =>
            sameRoute(e.route) && e.method === regMethod && matchesRoutePattern(e.path, parsed.path)
        );
        if (hit) {
          return {
            kind: "registered" as const,
            label: `${mod.page_name} · ${component.component_name}`
          };
        }
      }
    }
    return { kind: "unknown" as const };
  }, [parsed, regMethod, unregistered, catalog]);

  const submitRegister = async () => {
    if (!parsed || !regComponentId) {
      showMessage("warning", "Pega la URL o la ruta y elige la funcionalidad.");
      return;
    }
    const input =
      detected?.kind === "missing"
        ? detected.route
        : { route: parsed.route, method: regMethod, path: parsed.path };
    if (await doRegister(input, regComponentId)) {
      setRegistering(false);
      setRegUrl("");
      setRegComponentId(null);
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
              placeholder="Buscar funcionalidad o ruta"
              className="flex-1"
            />
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  { key: "component", label: "Funcionalidad" },
                  { key: "endpoint", label: "Endpoint" }
                ],
                onClick: ({ key }) =>
                  key === "endpoint" ? setRegistering(true) : setCreating(true)
              }}
            >
              <button type="button" className={BTN_PRIMARY}>
                <span className="flex items-center gap-1">
                  <Plus size={16} aria-hidden /> Nuevo <ChevronDown size={14} aria-hidden />
                </span>
              </button>
            </Dropdown>
          </div>
          <MiniSwitch
            checked={showTms}
            onChange={setShowTms}
            title={INCLUDE_OTHER_HINT}
            label={<span className="text-[13px] text-cp-ink-2">Incluir TMS</span>}
          />
          <div className="cp-list-scroll">
            {error && (
              <p className="px-3 py-2 text-[13px] text-cp-magenta">
                No se pudo cargar el catálogo: {error.message}
              </p>
            )}
            {isLoading && (
              <div className="flex justify-center py-6">
                <Spin />
              </div>
            )}
            {unregistered && (
              <PaneItem
                active={showingUnregistered}
                onClick={() => setSelectedId(UNREGISTERED)}
                title={`Rutas sin registrar (${unregistered.length})`}
                subtitle={
                  unregistered.length
                    ? "Responden 401 a todos hasta registrarlas"
                    : "Todas las rutas están registradas"
                }
              />
            )}
            {genericFirst.map(({ module, component }) => (
              <PaneItem
                key={component.component_id}
                active={
                  !showingUnregistered &&
                  component.component_id === selected?.component.component_id
                }
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
          {showingUnregistered && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[18px] font-semibold text-cp-ink">
                    Rutas sin registrar
                  </p>
                  <p className="text-[13px] text-cp-ink-3">
                    {unregistered?.length ?? 0} rutas del backend que piden rol y no están en el
                    catálogo
                  </p>
                </div>
                <MiniSwitch
                  checked={onlyWrites}
                  onChange={setOnlyWrites}
                  label={<span className="text-[13px] text-cp-ink-2">Solo escrituras</span>}
                />
              </div>
              <Notice tone="warning">
                El backend las tiene, pero sin fila en el catálogo responden 401 a cualquier
                usuario, incluso a un super admin. Regístralas en la funcionalidad que corresponda.
              </Notice>
              {unregisteredError && (
                <p className="text-[13px] text-cp-magenta">
                  No se pudieron cargar las rutas: {unregisteredError.message}
                </p>
              )}
              <div className="cp-list-scroll pr-1">
                {unregisteredVisible.length === 0 && (
                  <p className="py-4 text-[13px] text-cp-ink-3">No hay rutas con ese filtro.</p>
                )}
                {unregisteredVisible.map((route) => (
                  <div
                    key={`${route.method} ${route.route}${route.path}`}
                    className="grid min-h-[45px] grid-cols-[64px_minmax(0,1fr)_260px] items-center gap-3 border-b border-cp-muted"
                  >
                    <MethodTag method={route.method} />
                    <span
                      className="truncate font-mono text-[13px] text-cp-ink-2"
                      title={`/${route.route}${route.path}`}
                    >
                      /{route.route}
                      {route.path}
                    </span>
                    <Select
                      placeholder="Registrar en…"
                      value={null}
                      showSearch
                      optionFilterProp="label"
                      options={targetOptions}
                      onChange={(value) => value && askRegister(route, value)}
                      popupMatchSelectWidth={360}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {!showingUnregistered && !selected && !isLoading && (
            <Notice>Elige una funcionalidad.</Notice>
          )}
          {!showingUnregistered && selected && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[18px] font-semibold text-cp-ink">
                    {selected.module.page_name} · {selected.component.component_name}
                  </p>
                  <p className="text-[13px] text-cp-ink-3">
                    {selected.component.is_generic
                      ? "Cualquier rol puede usar estos endpoints"
                      : `${selected.component.roles_with_access} roles tienen acceso`}{" "}
                    · <EndpointStats component={selected.component} />
                  </p>
                </div>
                <MiniSwitch
                  checked={onlyWrites}
                  onChange={setOnlyWrites}
                  label={<span className="text-[13px] text-cp-ink-2">Solo escrituras</span>}
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
                  <p className="py-4 text-[13px] text-cp-ink-3">No hay endpoints con ese filtro.</p>
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
                        className="truncate font-mono text-[13px] text-cp-ink-2"
                        title={`/${endpoint.route}${endpoint.path}`}
                      >
                        /{endpoint.route}
                        {endpoint.path}
                      </span>
                      {locked ? (
                        <span
                          className="flex items-center gap-1 text-[13px] text-cp-ink-3"
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
          <p className="text-[13px] text-cp-ink-2">
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
            className="h-[var(--control-h)] rounded-lg border border-cp-line-2 bg-[#fafafa] px-3 text-[13px] outline-none focus:border-cp-ink-4"
          />
        </div>
      </Modal>

      <Modal
        open={registering}
        title="Registrar endpoint"
        width={620}
        onCancel={() => setRegistering(false)}
        onOk={submitRegister}
        okText="Registrar"
        cancelText="Cancelar"
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-cp-ink-2">
            Pega la URL que falla (con o sin dominio) o escribe la ruta. El backend solo acepta
            rutas que existan en su código.
          </p>
          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
            <Select
              value={regMethod}
              onChange={setRegMethod}
              options={METHODS.map((m) => ({ value: m, label: m }))}
            />
            <input
              value={regUrl}
              onChange={(e) => setRegUrl(e.target.value)}
              placeholder="https://…/api/visit-forms/199/responses/export?format=xlsx"
              className="h-[var(--control-h)] min-w-0 rounded-lg border border-cp-line-2 bg-[#fafafa] px-3 font-mono text-[13px] outline-none focus:border-cp-ink-4"
            />
          </div>
          {parsed && detected && (
            <div className="rounded-lg bg-cp-bg px-3 py-2 text-[13px] text-cp-ink-2">
              {detected.kind === "missing" && (
                <span className="flex flex-wrap items-center gap-2">
                  Ruta encontrada en el backend:
                  <MethodTag method={detected.route.method} />
                  <span className="font-mono">
                    /{detected.route.route}
                    {detected.route.path}
                  </span>
                </span>
              )}
              {detected.kind === "registered" && (
                <span>
                  Ya está registrada en {detected.label}. Para cambiarla, usa &quot;Mover a…&quot;.
                </span>
              )}
              {detected.kind === "unknown" && (
                <span>
                  No está entre las rutas sin registrar: revisa el método y la URL. Se intentará
                  registrar /{parsed.route}
                  {parsed.path}.
                </span>
              )}
            </div>
          )}
          <Select
            placeholder="Funcionalidad"
            value={regComponentId}
            onChange={setRegComponentId}
            showSearch
            optionFilterProp="label"
            options={targetOptions}
          />
          {regComponentId && (
            <div className="flex flex-col gap-1 text-[13px] text-cp-ink-2">
              {accessNote(regComponentId)}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
