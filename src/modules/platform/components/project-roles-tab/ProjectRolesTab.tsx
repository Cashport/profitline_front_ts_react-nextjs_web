"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, Spin } from "antd";
import SearchField from "@/components/ui/search-field/search-field";
import { MiniSwitch } from "@/components/ui/page-header-controls/page-header-controls";
import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { ApiError } from "@/utils/api/api";
import { updateProjectRoles } from "@/services/roles/projectRoles";
import { IBlockedProjectRole, IProjectRole } from "@/types/roles/IProjectRoles";
import { useProjectRoles } from "@/modules/platform/hooks/useProjectRoles";
import { groupRoles } from "@/modules/platform/lib/roleGroups";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  Notice,
  PaneItem
} from "@/modules/platform/components/shared/shared";

const sameIds = (a: Set<number>, b: Set<number>) =>
  a.size === b.size && Array.from(a).every((id) => b.has(id));

interface Props {
  onOpenRole: (rolId: number) => void;
}

export default function ProjectRolesTab({ onOpenRole }: Props) {
  const currentProjectId = useAppStore((s) => s.selectedProject?.ID);
  const projects = useAppStore((s) => s.projectsBasicInfo);
  const { showMessage } = useMessageApi();

  const [projectSearch, setProjectSearch] = useState("");
  const [projectId, setProjectId] = useState<number | null>(currentProjectId ?? null);
  const [draft, setDraft] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const { config, isLoading, error, mutate } = useProjectRoles(projectId);

  const savedIds = useMemo(
    () => new Set((config?.roles ?? []).filter((r) => r.enabled).map((r) => r.rol_id)),
    [config]
  );

  useEffect(() => {
    setDraft(new Set(savedIds));
  }, [savedIds]);

  const sortedProjects = useMemo(
    () =>
      [...projects]
        .sort((a, b) => a.NAME.localeCompare(b.NAME))
        .filter((p) => p.NAME.toLowerCase().includes(projectSearch.trim().toLowerCase())),
    [projects, projectSearch]
  );

  const selectedProjectName = projects.find((p) => p.ID === projectId)?.NAME ?? "";
  const dirty = Boolean(config) && !sameIds(draft, savedIds);
  const changes = (config?.roles ?? []).filter(
    (r) => draft.has(r.rol_id) !== savedIds.has(r.rol_id)
  ).length;

  const selectProject = (id: number) => {
    if (id === projectId) return;
    if (!dirty) return setProjectId(id);
    Modal.confirm({
      title: "¿Descartar los cambios?",
      content: `Tienes cambios sin guardar en ${selectedProjectName}.`,
      okText: "Descartar",
      cancelText: "Seguir editando",
      onOk: () => setProjectId(id)
    });
  };

  const toggleRole = (role: IProjectRole, checked: boolean) => {
    if (!checked && savedIds.has(role.rol_id) && role.active_users > 0) {
      showMessage(
        "warning",
        `${role.rol_name} tiene ${role.active_users} usuario(s) activo(s) en este proyecto. Cámbialos de rol antes de ocultarlo.`
      );
      return;
    }
    setDraft((prev) => {
      const next = new Set(prev);
      if (checked) next.add(role.rol_id);
      else next.delete(role.rol_id);
      return next;
    });
  };

  const save = async () => {
    if (!projectId) return;
    if (draft.size === 0) {
      showMessage("warning", "Deja al menos un rol habilitado.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProjectRoles(projectId, Array.from(draft));
      await mutate({ status: 200, message: "", data: updated }, { revalidate: false });
      showMessage("success", `Roles de ${selectedProjectName} actualizados.`);
    } catch (e) {
      const err = e as ApiError;
      const blocked = (err?.data?.blocked_roles ?? []) as IBlockedProjectRole[];
      if (err?.status === 409 && blocked.length) {
        showMessage(
          "error",
          `No se pueden ocultar roles con usuarios activos: ${blocked
            .map((r) => `${r.rol_name} (${r.active_users})`)
            .join(", ")}.`
        );
      } else {
        showMessage("error", err?.message || "No se pudieron guardar los roles.");
      }
    } finally {
      setSaving(false);
    }
  };

  const groups = groupRoles(config?.roles ?? []);

  return (
    <div className="cp-fill">
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] md:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="flex min-h-0 min-w-0 flex-col gap-3 border-cp-line pr-[18px] md:border-r">
          <SearchField
            value={projectSearch}
            onChange={setProjectSearch}
            placeholder="Buscar proyecto"
          />
          <div className="cp-list-scroll">
            {sortedProjects.map((project) => (
              <PaneItem
                key={project.ID}
                active={project.ID === projectId}
                onClick={() => selectProject(project.ID)}
                title={project.NAME}
              />
            ))}
            {sortedProjects.length === 0 && (
              <p className="px-3 py-2 text-[13px] text-cp-ink-3">Sin resultados</p>
            )}
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col gap-4 md:pl-[18px]">
          <div className="flex min-h-[48px] flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[18px] font-semibold text-cp-ink">
                {selectedProjectName || "Elige un proyecto"}
              </p>
              {config && (
                <p className="text-[13px] text-cp-ink-3">
                  {savedIds.size} de {config.roles.length} roles visibles
                  {dirty && ` · ${changes} cambio(s) sin guardar`}
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => setDraft(new Set(savedIds))}
              className={BTN_SECONDARY}
            >
              Descartar
            </button>
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={save}
              className={BTN_PRIMARY}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>

          {config && !config.configured && (
            <Notice>
              Este proyecto todavía no tiene una lista propia: hoy ve los {config.roles.length}{" "}
              roles. Al guardar, solo verá los que dejes habilitados.
            </Notice>
          )}

          {isLoading && (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          )}

          {error && !isLoading && (
            <p className="text-[13px] text-cp-magenta">
              No se pudieron cargar los roles de este proyecto.
            </p>
          )}

          <div className="cp-list-scroll pr-1">
            {config &&
              groups.map(({ group, roles }) => (
                <section key={group} className="mb-4 flex flex-col">
                  <div className="flex items-baseline gap-2 border-b border-cp-line pb-2">
                    <p className="text-[13.5px] font-semibold text-cp-ink">{group}</p>
                    <p className="text-[13px] text-cp-ink-3">
                      {roles.filter((r) => draft.has(r.rol_id)).length} de {roles.length}
                    </p>
                  </div>
                  {roles.map((role) => {
                    const checked = draft.has(role.rol_id);
                    const changed = checked !== savedIds.has(role.rol_id);
                    return (
                      <div
                        key={role.rol_id}
                        className="grid min-h-[45px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-cp-muted px-1"
                      >
                        <p className="min-w-0 truncate text-[13.5px]">
                          <button
                            type="button"
                            onClick={() => onOpenRole(role.rol_id)}
                            className="border-0 bg-transparent p-0 text-left text-cp-blue hover:text-cp-blue-hover hover:underline"
                            title="Ver qué puede hacer este rol"
                          >
                            {role.rol_name}
                          </button>
                          {changed && (
                            <span className="ml-2 rounded-[5px] bg-cp-muted px-1.5 py-px text-[13px] font-semibold text-cp-ink-2">
                              Sin guardar
                            </span>
                          )}
                        </p>
                        <p className="whitespace-nowrap text-right text-[13px] text-cp-ink-3">
                          {role.active_users === 1
                            ? "1 usuario activo"
                            : `${role.active_users} usuarios activos`}
                        </p>
                        <MiniSwitch
                          checked={checked}
                          onChange={(value) => toggleRole(role, value)}
                          title={
                            checked && role.active_users > 0
                              ? "Tiene usuarios activos: cámbialos de rol antes de ocultarlo"
                              : undefined
                          }
                          label={
                            <span className="w-[72px] text-[13px] text-cp-ink-2">
                              {checked ? "Visible" : "Oculto"}
                            </span>
                          }
                        />
                      </div>
                    );
                  })}
                </section>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
