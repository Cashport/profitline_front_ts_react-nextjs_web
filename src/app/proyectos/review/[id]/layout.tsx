"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Tabs, Flex, Button, Skeleton, Typography, Result } from "antd";

import { extractSingleParam } from "@/utils/utils";
import { useProject } from "@/hooks/useProject";

import { SideBar } from "@/components/molecules/SideBar/SideBar";

import "./layoutProjectDetail.scss";

const { Title, Text } = Typography;

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
    <main className="layoutProjectDetail">
      <SideBar />
      <Flex vertical className="containerTabsAndContent">
        {/* Title Section */}
        <Flex component={"navbar"} align="center" justify="space-between">
          <Flex className="infoHeaderProject">
            <Flex gap={"2rem"} align="center" style={{ width: "100%" }}>
              {loading ? (
                <>
                  <Skeleton.Input size="large" />
                  <Skeleton.Input size="large" />
                </>
              ) : (
                <Title level={1} className="titleName">
                  {data?.PROJECT_DESCRIPTION ?? ""}
                </Title>
              )}
            </Flex>
          </Flex>
        </Flex>

        {/* Tabs Section */}
        {!loading && !data ? (
          <Flex vertical>
            <Flex align="center" gap={"2rem"}>
              <Button href="/settings">Volver</Button>
              <Text>Informacion No encontrada</Text>
            </Flex>
            <Result
              status="404"
              title="404"
              subTitle="Lo siento este proyecto no existe"
              extra={
                <Button type="primary" href="/settings">
                  Back Home
                </Button>
              }
            />
          </Flex>
        ) : (
          <Flex className="tabsContainer">
            <Tabs
              style={{ width: "100%", height: "100%" }}
              activeKey={activeTab}
              onChange={handleTabChange}
              size="large"
              items={items}
            />
          </Flex>
        )}

        {/* Render the active tab's content */}
        <div className="tabContent">{children}</div>
      </Flex>
    </main>
  );
}
