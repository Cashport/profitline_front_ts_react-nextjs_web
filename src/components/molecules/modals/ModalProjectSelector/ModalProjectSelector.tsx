import { Avatar, Modal } from "antd";
import { Clipboard } from "phosphor-react";
import { usePathname, useRouter } from "next/navigation";

import { useAppStore } from "@/lib/store/store";
import { ISelectedProject } from "@/lib/slices/createProjectSlice";

import "./modalProjectSelector.scss";
interface Props {
  isOpen: boolean;
  onClose: () => void;
}
export const ModalProjectSelector = ({ isOpen, onClose }: Props) => {
  const path = usePathname();
  const router = useRouter();
  const selectedProject = useAppStore((state) => state.selectedProject);
  const setSelectedProject = useAppStore((state) => state.setSelectedProject);
  const projects = useAppStore((state) => state.projectsBasicInfo);

  const handleSelectProject = (project: ISelectedProject) => {
    const projectInfo: ISelectedProject = {
      ID: project.ID,
      NAME: project.NAME,
      LOGO: project.LOGO,
      views_permissions: project.views_permissions,
      action_permissions: project.action_permissions,
      isSuperAdmin: project.isSuperAdmin
    };
    setSelectedProject(projectInfo);
    // set session storage for selectedProjectId, used in the useNotificationStore
    sessionStorage.setItem("projectId", project.ID.toString());
    if (path.startsWith("/proyectos/review")) {
      router.push(`/proyectos/review/${project.ID}/detail`);
    } else if (path.startsWith("/clientes/all")) {
      // do nothing
    } else {
      router.push("/dashboard");
    }

    onClose();
  };

  if (projects?.length > 1) {
    return (
      <Modal
        className="modalProjectSelector"
        open={isOpen}
        onCancel={onClose}
        footer={false}
        width={"60%"}
      >
        <h2 className="modalProjectSelector__title">Elegir proyecto</h2>
        <div className="modalProjectSelector__projects">
          {projects?.map((project) => (
            <div onClick={() => handleSelectProject(project)} className="project" key={project.ID}>
              {project.LOGO ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="project__image" src={project.LOGO} alt="Project image" />
              ) : (
                <Avatar
                  shape="square"
                  className="imageWithoutImage"
                  size={65}
                  icon={<Clipboard />}
                />
              )}

              <div className={`project__name ${project.ID === selectedProject.ID && "-selected"}`}>
                <p>{project.NAME}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    );
  }
  return null;
};
