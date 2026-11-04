"use client";
import { SideBar } from "@/components/molecules/SideBar/SideBar";
import { ProjectTable } from "@/components/molecules/tables/ProjectsTable/ProjectsTable";
import { useTranslations } from "use-intl";

import "./projects.scss";
import Header from "../../header";

export const ProjectsView = () => {
  const t = useTranslations("projects");
  return (
    <main className="mainProject">
      <SideBar />
      <div className="contentProject">
        <Header title={t("title")} />
        <ProjectTable />
      </div>
    </main>
  );
};
