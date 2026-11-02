"use client";

import { useMemo, useState } from "react";
import { Modal, Spin } from "antd";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MiniSwitch } from "@/components/ui/page-header-controls/page-header-controls";
import {
  useAdminRoles,
  useRoleDetail,
  useRolesCatalog
} from "@/modules/platform/hooks/useRolesAdmin";
import {
  BTN_SECONDARY,
  EndpointLine,
  EndpointStats,
  Notice,
  SystemBadge,
  filterCatalog
} from "@/modules/platform/components/shared/shared";

interface Props {
  rolId: number | null;
  onClose: () => void;
  onEdit?: (rolId: number) => void;
}

export default function RoleCapabilitiesModal({ rolId, onClose, onEdit }: Props) {
  const { detail, isLoading: loadingDetail, error: detailError } = useRoleDetail(rolId);
  const {
    catalog: fullCatalog,
    isLoading: loadingCatalog,
    error: catalogError
  } = useRolesCatalog();
  const isTmsRole = (detail?.rol_name ?? "").toLowerCase().startsWith("tms-");
  const catalog = useMemo(
    () => (fullCatalog ? filterCatalog(fullCatalog, isTmsRole) : undefined),
    [fullCatalog, isTmsRole]
  );
  const { roles } = useAdminRoles();
  const [showMissing, setShowMissing] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const summary = roles?.find((r) => r.rol_id === rolId);
  const granted = useMemo(() => new Set(detail?.component_ids ?? []), [detail]);

  const modules = useMemo(
    () =>
      (catalog ?? [])
        .map((module) => ({
          ...module,
          components: module.components.filter(
            (c) => !c.is_generic && (showMissing || granted.has(c.component_id))
          )
        }))
        .filter((module) => module.components.length > 0),
    [catalog, granted, showMissing]
  );

  const screens = useMemo(
    () =>
      (catalog ?? [])
        .filter((m) => m.components.some((c) => granted.has(c.component_id)))
        .map((m) => m.page_name),
    [catalog, granted]
  );

  const genericEndpoints = useMemo(
    () =>
      (catalog ?? [])
        .filter((m) => m.product === "Cashport")
        .flatMap((m) => m.components)
        .filter((c) => c.is_generic)
        .reduce((total, c) => total + c.endpoints.length, 0),
    [catalog]
  );

  const toggle = (componentId: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(componentId)) next.delete(componentId);
      else next.add(componentId);
      return next;
    });

  return (
    <Modal
      open={rolId !== null}
      onCancel={onClose}
      footer={null}
      width={860}
      destroyOnClose
      title={
        <div className="flex flex-wrap items-center gap-2 pr-6">
          <span className="text-[18px] font-semibold text-cp-ink">
            {detail?.rol_name ?? summary?.rol_name ?? "Rol"}
          </span>
          {detail?.is_system && <SystemBadge />}
        </div>
      }
    >
      {(loadingDetail || loadingCatalog) && (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      )}

      {(detailError || catalogError) && !loadingDetail && !loadingCatalog && (
        <p className="text-[13px] text-cp-magenta">
          No se pudo cargar el rol: {(detailError || catalogError)?.message}
        </p>
      )}

      {detail && catalog && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-cp-ink-3">
            <span>{granted.size} funcionalidades</span>
            {summary && (
              <>
                <span>·</span>
                <span>{summary.active_users} usuarios activos</span>
                <span>·</span>
                <span>{summary.projects} proyectos</span>
              </>
            )}
            <span className="flex-1" />
            {onEdit && (
              <button type="button" className={BTN_SECONDARY} onClick={() => onEdit(detail.rol_id)}>
                Editar rol
              </button>
            )}
          </div>

          <div>
            <p className="mb-2 text-[13px] font-semibold text-cp-ink">Pantallas que ve</p>
            <div className="flex flex-wrap gap-2">
              {screens.length === 0 && (
                <span className="text-[13px] text-cp-ink-3">Ninguna pantalla</span>
              )}
              {screens.map((screen) => (
                <span
                  key={screen}
                  className="rounded-[7px] bg-cp-bg px-2.5 py-1 text-[13px] text-cp-ink-2"
                >
                  {screen}
                </span>
              ))}
            </div>
          </div>

          <Notice tone="warning">
            Además, cualquier rol puede usar {genericEndpoints} endpoints de &quot;Generico&quot;. Y
            hoy el backend no distingue ver de modificar: con acceso a una funcionalidad, el rol usa
            todos sus endpoints.
          </Notice>

          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-cp-ink">Funcionalidades</p>
            <MiniSwitch
              checked={showMissing}
              onChange={setShowMissing}
              label={<span className="text-[13px] text-cp-ink-2">Mostrar lo que no tiene</span>}
            />
          </div>

          <div className="max-h-[50vh] overflow-y-auto pr-1">
            {modules.map((module) => (
              <section key={module.page_id} className="mb-3">
                <p className="border-b border-cp-line pb-1 text-[13px] font-semibold text-cp-ink">
                  {module.page_name}
                </p>
                {module.components.map((component) => {
                  const has = granted.has(component.component_id);
                  const open = expanded.has(component.component_id);
                  return (
                    <div key={component.component_id} className="border-b border-cp-muted">
                      <button
                        type="button"
                        onClick={() => toggle(component.component_id)}
                        className="grid w-full grid-cols-[18px_minmax(0,1fr)_auto_84px] items-center gap-3 border-0 bg-transparent px-1 py-2 text-left"
                        disabled={component.endpoints.length === 0}
                      >
                        {component.endpoints.length > 0 ? (
                          open ? (
                            <ChevronDown size={16} className="text-cp-ink-3" />
                          ) : (
                            <ChevronRight size={16} className="text-cp-ink-3" />
                          )
                        ) : (
                          <span />
                        )}
                        <span className="truncate text-[13px] text-cp-ink">
                          {component.component_name}
                        </span>
                        <EndpointStats component={component} />
                        <span
                          className={
                            has
                              ? "whitespace-nowrap rounded-[5px] bg-cp-lime px-2 py-px text-center text-[13px] font-semibold text-[#141414]"
                              : "whitespace-nowrap rounded-[5px] bg-cp-muted px-2 py-px text-center text-[13px] font-semibold text-cp-ink-3"
                          }
                        >
                          {has ? "Acceso" : "No"}
                        </span>
                      </button>
                      {open && (
                        <div className="pb-2 pl-8">
                          {component.endpoints.map((endpoint) => (
                            <EndpointLine key={endpoint.endpoint_id} {...endpoint} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
