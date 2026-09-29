import { IProject } from "@/types/projects/IProjects";
import { IViewPermission } from "@/types/userPermissions/IUserPermissions";
import { setProjectInApi } from "@/utils/api/api";

export type ISelectedProject = {
  ID: number;
  NAME: string;
  LOGO: string;
  views_permissions?: IViewPermission[];
  action_permissions?: string[];
  isSuperAdmin?: boolean;
  /** Rol del usuario en el proyecto (2 = administrador). */
  rol_id?: number;
};
export interface ProjectSlice {
  projects: IProject[];
  selectedProject: ISelectedProject;
  projectsBasicInfo: ISelectedProject[];
  // eslint-disable-next-line no-unused-vars
  setProjects: (by: IProject[]) => void;
  // eslint-disable-next-line no-unused-vars
  setSelectedProject: (by: ISelectedProject) => void;
  // eslint-disable-next-line no-unused-vars
  setProjectsBasicInfo: (by: ISelectedProject[]) => void;
}

export const createProjectSlice = (set: any): ProjectSlice => ({
  projects: [],
  selectedProject: {} as ISelectedProject,
  projectsBasicInfo: [],
  setProjects: (by: IProject[]) => set({ projects: by }),
  setSelectedProject: (by: ISelectedProject) => {
    setProjectInApi(by.ID);
    return set({ selectedProject: by });
  },
  setProjectsBasicInfo: (by: ISelectedProject[]) => set({ projectsBasicInfo: by })
});
