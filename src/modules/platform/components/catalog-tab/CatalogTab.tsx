"use client";

import { useMemo, useState } from "react";
import { Dropdown, Modal, Select, Spin } from "antd";
import { ChevronDown, Lock, Plus } from "lucide-react";
import { useTranslations } from "use-intl";
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
  filterCatalog
} from "@/modules/platform/components/shared/shared";

const LOCKED_ROUTE = "role";
const UNREGISTERED = "unregistered" as const;
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

type Located = { module: ICatalogModule; component: ICatalogComponent };

export default function CatalogTab() {
  const { showMessage } = useMessageApi();
  const t = useTranslations("platform.catalog");
  const tShared = useTranslations("platform.shared");
  const tCommon = useTranslations("common");
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
      return <p>{t("accessNote.generic")}</p>;
    }
    return (
      <>
        <p>
          {t("accessNote.roles", {
            feature: target.component_name,
            count: target.roles_with_access
          })}
        </p>
        {target.roles_with_access === 0 && (
          <p className="font-semibold text-cp-magenta">{t("accessNote.noRoles")}</p>
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
      title: t("move.title", {
        endpoint: `${endpoint.method} /${endpoint.route}${endpoint.path}`
      }),
      width: 560,
      content: (
        <div className="flex flex-col gap-2 text-[13px]">
          <p>
            {t.rich("move.content", {
              from: from.component_name,
              to: toLabel,
              b: (chunks) => <b>{chunks}</b>
            })}
          </p>
          {accessNote(targetId)}
        </div>
      ),
      okText: t("move.ok"),
      cancelText: tCommon("actions.cancel"),
      onOk: async () => {
        try {
          await moveEndpoint(endpoint.endpoint_id, targetId);
          await refresh();
          showMessage("success", t("move.success", { target: toLabel }));
        } catch (e) {
          showMessage("error", (e as ApiError)?.message || t("move.error"));
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
        t("register.success", {
          endpoint: `${saved.method} /${saved.route}${saved.path}`,
          target: componentLabel(componentId)
        })
      );
      return true;
    } catch (e) {
      showMessage("error", (e as ApiError)?.message || t("register.error"));
      return false;
    }
  };

  const askRegister = (route: IUnregisteredRoute, componentId: number) => {
    Modal.confirm({
      title: t("register.title", { endpoint: `${route.method} /${route.route}${route.path}` }),
      width: 560,
      content: (
        <div className="flex flex-col gap-2 text-[13px]">
          <p>
            {t.rich("register.content", {
              target: componentLabel(componentId),
              b: (chunks) => <b>{chunks}</b>
            })}
          </p>
          {accessNote(componentId)}
        </div>
      ),
      okText: t("register.ok"),
      cancelText: tCommon("actions.cancel"),
      onOk: () => doRegister(route, componentId)
    });
  };

  const submitNewComponent = async () => {
    if (!newPageId || !newName.trim()) {
      showMessage("warning", t("newFeatureModal.missingFields"));
      return;
    }
    try {
      const { component_id } = await createComponent(newPageId, newName.trim());
      await mutate();
      setSelectedId(component_id);
      setCreating(false);
      setNewName("");
      showMessage("success", t("newFeatureModal.created"));
    } catch (e) {
      showMessage("error", (e as ApiError)?.message || t("newFeatureModal.error"));
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
      showMessage("warning", t("register.missingFields"));
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
              placeholder={tShared("searchFeatureOrRoute")}
              className="flex-1"
            />
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  { key: "component", label: t("newFeature") },
                  { key: "endpoint", label: t("newEndpoint") }
                ],
                onClick: ({ key }) =>
                  key === "endpoint" ? setRegistering(true) : setCreating(true)
              }}
            >
              <button type="button" className={BTN_PRIMARY}>
                <span className="flex items-center gap-1">
                  <Plus size={16} aria-hidden /> {t("newButton")}{" "}
                  <ChevronDown size={14} aria-hidden />
                </span>
              </button>
            </Dropdown>
          </div>
          <MiniSwitch
            checked={showTms}
            onChange={setShowTms}
            title={tShared("includeOtherHint")}
            label={<span className="text-[13px] text-cp-ink-2">{tShared("includeTms")}</span>}
          />
          <div className="cp-list-scroll">
            {error && (
              <p className="px-3 py-2 text-[13px] text-cp-magenta">
                {t("loadError", { error: error.message })}
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
                title={t("unregisteredItem", { count: unregistered.length })}
                subtitle={unregistered.length ? t("unregisteredItemHint") : t("allRegistered")}
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
                    ? t("genericName", { name: component.component_name })
                    : component.component_name
                }
                subtitle={
                  component.is_generic
                    ? t("itemSubtitleGeneric", {
                        page: module.page_name,
                        endpoints: component.endpoints.length
                      })
                    : t("itemSubtitle", {
                        page: module.page_name,
                        endpoints: component.endpoints.length,
                        roles: component.roles_with_access
                      })
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
                    {t("unregisteredTitle")}
                  </p>
                  <p className="text-[13px] text-cp-ink-3">
                    {t("unregisteredDescription", { count: unregistered?.length ?? 0 })}
                  </p>
                </div>
                <MiniSwitch
                  checked={onlyWrites}
                  onChange={setOnlyWrites}
                  label={<span className="text-[13px] text-cp-ink-2">{t("onlyWrites")}</span>}
                />
              </div>
              <Notice tone="warning">{t("unregisteredNotice")}</Notice>
              {unregisteredError && (
                <p className="text-[13px] text-cp-magenta">
                  {t("routesLoadError", { error: unregisteredError.message })}
                </p>
              )}
              <div className="cp-list-scroll pr-1">
                {unregisteredVisible.length === 0 && (
                  <p className="py-4 text-[13px] text-cp-ink-3">{t("noRoutes")}</p>
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
                      placeholder={t("registerIn")}
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

          {!showingUnregistered && !selected && !isLoading && <Notice>{t("pickFeature")}</Notice>}
          {!showingUnregistered && selected && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[18px] font-semibold text-cp-ink">
                    {selected.module.page_name} · {selected.component.component_name}
                  </p>
                  <p className="text-[13px] text-cp-ink-3">
                    {selected.component.is_generic
                      ? t("genericAccess")
                      : t("rolesWithAccess", { count: selected.component.roles_with_access })}{" "}
                    · <EndpointStats component={selected.component} />
                  </p>
                </div>
                <MiniSwitch
                  checked={onlyWrites}
                  onChange={setOnlyWrites}
                  label={<span className="text-[13px] text-cp-ink-2">{t("onlyWrites")}</span>}
                />
              </div>

              {selected.component.is_generic && (
                <Notice tone="warning">{t("genericNotice")}</Notice>
              )}

              <div className="cp-list-scroll pr-1">
                {endpoints.length === 0 && (
                  <p className="py-4 text-[13px] text-cp-ink-3">{t("noEndpoints")}</p>
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
                          title={t("lockedHint")}
                        >
                          <Lock size={14} aria-hidden /> {t("locked")}
                        </span>
                      ) : (
                        <Select
                          placeholder={t("moveTo")}
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
        title={t("newFeatureModal.title")}
        onCancel={() => setCreating(false)}
        onOk={submitNewComponent}
        okText={tCommon("actions.create")}
        cancelText={tCommon("actions.cancel")}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-cp-ink-2">{t("newFeatureModal.description")}</p>
          <Select
            placeholder={t("newFeatureModal.modulePlaceholder")}
            value={newPageId}
            onChange={setNewPageId}
            showSearch
            optionFilterProp="label"
            options={(catalog ?? []).map((m) => ({ value: m.page_id, label: m.page_name }))}
          />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("newFeatureModal.namePlaceholder")}
            maxLength={255}
            className="h-[var(--control-h)] rounded-lg border border-cp-line-2 bg-[#fafafa] px-3 text-[13px] outline-none focus:border-cp-ink-4"
          />
        </div>
      </Modal>

      <Modal
        open={registering}
        title={t("register.modalTitle")}
        width={620}
        onCancel={() => setRegistering(false)}
        onOk={submitRegister}
        okText={t("register.ok")}
        cancelText={tCommon("actions.cancel")}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-cp-ink-2">{t("register.description")}</p>
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
                  {t("register.found")}
                  <MethodTag method={detected.route.method} />
                  <span className="font-mono">
                    /{detected.route.route}
                    {detected.route.path}
                  </span>
                </span>
              )}
              {detected.kind === "registered" && (
                <span>{t("register.alreadyRegistered", { target: detected.label })}</span>
              )}
              {detected.kind === "unknown" && (
                <span>{t("register.unknown", { route: `/${parsed.route}${parsed.path}` })}</span>
              )}
            </div>
          )}
          <Select
            placeholder={t("register.featurePlaceholder")}
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
