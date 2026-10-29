"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Tabs, Flex, Skeleton } from "antd";

import { extractSingleParam } from "@/utils/utils";
import { useProject } from "@/hooks/useProject";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

import "./layoutProjectDetail.scss";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const projectId = extractSingleParam(params.id) || "";
  const { loading, data } = useProject({ id: projectId });

  // Extract current tab from the URL path
  const pathParts = pathname.split("/");
  const activeTab = pathParts[4];

  // Function to update URL when switching tabs
  const handleTabChange = (key: string) => {
    router.push(`/proyectos/review/${projectId}/${key}`);
  };

  const items = [
    { key: "detail", label: "Proyecto" },
    {
      key: "business-rules",
      label: "Reglas de Negocio"
    },
    { key: "clients", label: "Clientes" },
    { key: "users", label: "Usuarios" },
    { key: "accounts", label: "Cuentas" },
    { key: "client-groups", label: "Grupos de Clientes" },
    { key: "communications", label: "Comunicaciones" },
    { key: "requirements", label: "Requerimientos" }
  ];

  return (
    // Header compartido: nombre del proyecto y "‹" al listado (docs/DESIGN.md §4)
    <ViewWrapper
      headerTitle={loading ? "" : data?.PROJECT_DESCRIPTION ?? ""}
      headerTitleExtra={loading ? <Skeleton.Input size="small" active /> : undefined}
      headerBack="/settings"
    >
      <Flex vertical className="cp-card containerTabsAndContent px-[18px] py-[14px]">
        {/* Tabs Section */}
        <Flex className="tabsContainer">
          <Tabs
            style={{ width: "100%", height: "100%" }}
            activeKey={activeTab}
            onChange={handleTabChange}
            size="large"
            items={items}
          />
        </Flex>

        {/* Render the active tab's content */}
        <div className="tabContent">{children}</div>
      </Flex>
    </ViewWrapper>
  );
}
