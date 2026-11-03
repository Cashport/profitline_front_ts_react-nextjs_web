"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/organisms/header";
import UiTab from "@/components/ui/ui-tab";
import { useAppStore } from "@/lib/store/store";
import ProjectRolesTab from "@/modules/platform/components/project-roles-tab/ProjectRolesTab";
import RolesTab, { RoleSelection } from "@/modules/platform/components/roles-tab/RolesTab";
import CatalogTab from "@/modules/platform/components/catalog-tab/CatalogTab";
import RoleCapabilitiesModal from "@/modules/platform/components/role-capabilities-modal/RoleCapabilitiesModal";

const TABS = ["por-proyecto", "roles", "catalogo"] as const;
type TabKey = (typeof TABS)[number];

export default function RolesConsole() {
  const isSuperAdmin = useAppStore((s) => Boolean(s.selectedProject?.isSuperAdmin));
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get("tab") as TabKey | null;
  const tab: TabKey = requested && TABS.includes(requested) ? requested : "por-proyecto";

  const [roleSelection, setRoleSelection] = useState<RoleSelection>(null);
  const [modalRolId, setModalRolId] = useState<number | null>(null);

  if (!isSuperAdmin) {
    return (
      <div className="cp-page min-h-full">
        <Header title="Roles y permisos" back="/market-admin" />
        <div className="cp-card p-[var(--card-pad)] text-[13.5px] text-cp-ink-2">
          Esta sección es solo para administradores de Profitline.
        </div>
      </div>
    );
  }

  const changeTab = (key: string) => router.replace(`${pathname}?tab=${key}`);

  const editRole = (rolId: number) => {
    setModalRolId(null);
    setRoleSelection(rolId);
    changeTab("roles");
  };

  return (
    <div className="cp-page min-h-full">
      <Header title="Roles y permisos" back="/market-admin" />
      <div className="cp-card cp-list-card overflow-hidden px-[18px] pb-[14px]">
        <UiTab
          activeKey={tab}
          onChangeTab={changeTab}
          tabs={[
            {
              key: "por-proyecto",
              label: "Roles por proyecto",
              children: <ProjectRolesTab onOpenRole={setModalRolId} />
            },
            {
              key: "roles",
              label: "Roles",
              children: (
                <RolesTab
                  selection={roleSelection}
                  onSelect={setRoleSelection}
                  onOpenRole={setModalRolId}
                />
              )
            },
            {
              key: "catalogo",
              label: "Catálogo de endpoints",
              children: <CatalogTab />
            }
          ]}
        />
      </div>
      <RoleCapabilitiesModal
        rolId={modalRolId}
        onClose={() => setModalRolId(null)}
        onEdit={editRole}
      />
    </div>
  );
}
