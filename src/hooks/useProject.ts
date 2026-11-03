import { getTranslator } from "@/i18n/translator";
import { useState, useEffect } from "react";
import { getProjectDetails } from "@/services/projects/projects"; // Import your API call
import { IProject } from "@/types/projects/IProject";
import { useAppStore } from "@/lib/store/store";
import { ISelectedProject } from "@/lib/slices/createProjectSlice";

interface Props {
  id: string;
}

export const useProject = ({ id }: Props) => {
  const { projectsBasicInfo, setSelectedProject } = useAppStore((state) => state);
  const [loading, setLoading] = useState(false);
  const [projectDetails, setProjectDetails] = useState<IProject>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return; // Prevent unnecessary calls

      setLoading(true);
      setError(null); // Reset error on new fetch

      try {
        const response = await getProjectDetails(id);

        if (response) {
          setProjectDetails(response);
        } else {
          console.warn("No data received for project:", id);
          setError(getTranslator("shared")("project.notFound"));
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setError(getTranslator("shared")("project.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  //  Ensure selected project is updated in the store
  useEffect(() => {
    if (!projectDetails || !projectsBasicInfo) return;

    const selectedProject = projectsBasicInfo.find((project) => project.ID === projectDetails.ID);
    if (selectedProject) {
      const projectInfo: ISelectedProject = {
        ID: selectedProject.ID,
        NAME: selectedProject.NAME,
        LOGO: selectedProject.LOGO,
        views_permissions: selectedProject.views_permissions,
        action_permissions: selectedProject.action_permissions,
        isSuperAdmin: selectedProject.isSuperAdmin
      };
      setSelectedProject(projectInfo);
    } else {
      console.warn(`Project with ID: ${id} not found in fetched projects`);
    }
  }, [projectDetails, projectsBasicInfo, setSelectedProject]);

  return {
    data: projectDetails,
    loading,
    error
  };
};
