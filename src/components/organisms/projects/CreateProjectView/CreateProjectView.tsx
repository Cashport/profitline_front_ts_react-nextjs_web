import { Tabs, TabsProps, message } from "antd";
import { useTranslations } from "use-intl";

// components
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { ProjectFormTab } from "@/components/molecules/tabs/Projects/ProjectForm/ProjectFormTab";
import { addProject } from "@/services/projects/projects";

//vars
import { CREATED } from "@/utils/constants/globalConstants";
import { useRouter } from "next/navigation";

import "./createproject.scss";
import { IFormProject } from "@/types/projects/IFormProject";

export const CreateProjectView = () => {
  const t = useTranslations("projects");
  const { push } = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const onCreateProject = async (data: IFormProject) => {
    if (!data.logo) return;
    try {
      const response = await addProject(data);
      if (response.status === CREATED) {
        messageApi.open({
          type: "success",
          content: t("create.success")
        });
        push("/settings");
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: t("create.error")
      });
    }
  };
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t("tabs.createProject"),
      children: <ProjectFormTab statusForm="create" onSubmitForm={onCreateProject} />
    },
    {
      key: "2",
      label: t("tabs.businessRules"),
      children: <ProjectFormTab statusForm="create" onSubmitForm={onCreateProject} />
    },
    {
      key: "3",
      label: t("tabs.clients"),
      children: <ProjectFormTab statusForm="create" onSubmitForm={onCreateProject} />
    },
    {
      key: "4",
      label: t("tabs.users"),
      children: <ProjectFormTab statusForm="create" onSubmitForm={onCreateProject} />
    },
    {
      key: "5",
      label: t("tabs.accounts"),
      children: <ProjectFormTab statusForm="create" onSubmitForm={onCreateProject} />
    },
    {
      key: "6",
      label: t("tabs.clientGroups"),
      children: <ProjectFormTab statusForm="create" onSubmitForm={onCreateProject} />
    },
    {
      key: "7",
      label: t("tabs.approvals"),
      children: <ProjectFormTab statusForm="create" onSubmitForm={onCreateProject} />
    },
    {
      key: "8",
      label: t("tabs.communications"),
      children: <ProjectFormTab statusForm="create" onSubmitForm={onCreateProject} />
    }
  ];

  return (
    <>
      {contextHolder}
      {/* Header compartido con "‹" al listado de proyectos (docs/DESIGN.md §4) */}
      <ViewWrapper headerTitle={t("create.headerTitle")} headerBack="/settings">
        {/* ------------Main Info Project-------------- */}
        <div className="cp-card createProjectCard px-[18px] py-[14px]">
          <Tabs
            style={{ width: "100%", height: "100%" }}
            defaultActiveKey="1"
            items={items}
            size="large"
          />
        </div>
      </ViewWrapper>
    </>
  );
};
