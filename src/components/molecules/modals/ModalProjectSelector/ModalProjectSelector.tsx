import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, Modal } from "antd";
import { CaretDown, Clipboard } from "phosphor-react";
import { usePathname, useRouter } from "next/navigation";

import { useAppStore } from "@/lib/store/store";
import { ISelectedProject } from "@/lib/slices/createProjectSlice";
import { checkUserViewPermissions } from "@/utils/utils";
import { getFirstPermittedRoute } from "@/utils/permissions/routePermissions";

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

  // Con muchos proyectos la grilla hace scroll: se marca que hay más abajo para que no
  // pase desapercibido (degradado + "Ver más proyectos").
  const listRef = useRef<HTMLDivElement | null>(null);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const updateHasMore = useCallback(() => {
    const el = listRef.current;
    setHasMoreBelow(!!el && el.scrollHeight - el.scrollTop - el.clientHeight > 4);
  }, []);
  const observerRef = useRef<ResizeObserver | null>(null);
  const setListRef = useCallback(
    (el: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      listRef.current = el;
      if (!el) return;
      observerRef.current = new ResizeObserver(updateHasMore);
      observerRef.current.observe(el);
      updateHasMore();
    },
    [updateHasMore]
  );
  useEffect(() => () => observerRef.current?.disconnect(), []);
  useEffect(updateHasMore, [projects, isOpen, updateHasMore]);

  const scrollDown = () =>
    listRef.current?.scrollBy({ top: listRef.current.clientHeight * 0.8, behavior: "smooth" });

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
      if (!checkUserViewPermissions(projectInfo, "Clientes")) {
        router.push(getFirstPermittedRoute(projectInfo));
      }
    } else {
      const firstRoute = getFirstPermittedRoute(projectInfo);
      router.push(firstRoute);
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
        <div className="modalProjectSelector__body">
          <div ref={setListRef} onScroll={updateHasMore} className="modalProjectSelector__projects">
            {projects?.map((project) => (
              <div
                onClick={() => handleSelectProject(project)}
                className="project"
                key={project.ID}
              >
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

                <div
                  className={`project__name ${project.ID === selectedProject.ID && "-selected"}`}
                >
                  <p>{project.NAME}</p>
                </div>
              </div>
            ))}
          </div>
          {hasMoreBelow && (
            <button type="button" className="modalProjectSelector__more" onClick={scrollDown}>
              Ver más proyectos
              <CaretDown size={14} weight="bold" />
            </button>
          )}
        </div>
      </Modal>
    );
  }
  return null;
};
