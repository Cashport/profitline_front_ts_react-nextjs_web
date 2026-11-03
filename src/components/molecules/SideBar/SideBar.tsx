"use client";
import { useEffect, useState, useRef } from "react";
import { Avatar, Button, Flex } from "antd";
import { usePathname } from "next/navigation";
import { Clipboard, List } from "phosphor-react";

import { useLogoutConfirm } from "@/components/organisms/header/user-menu/logout-confirm";
import { useAppStore } from "@/lib/store/store";
import useStore from "@/lib/hook/useStore";
import { getUserPermissions } from "@/services/permissions/userPermissions";
import { setProjectInApi } from "@/utils/api/api";

import useScreenHeight from "@/components/hooks/useScreenHeight";
import useScreenWidth from "@/components/hooks/useScreenWidth";
import { ModalProjectSelector } from "../modals/ModalProjectSelector/ModalProjectSelector";
import {
  ModulesButtons,
  RailIcon,
  RailItem,
  SettingsRailItem
} from "@/components/atoms/NavigationBar/ModulesButtons/ModulesButtons";
import { usePermissionRedirect } from "@/hooks/usePermissionRedirect";

import "./sidebar.scss";

/** Preferencia de este navegador: menú lateral fijado abierto. */
const RAIL_PINNED_KEY = "cashport:rail-pinned";

export const SideBar = () => {
  usePermissionRedirect();

  const [modalProjectSelectorOpen, setModalProjectSelectorOpen] = useState(false);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [isModuleMenuOpen, setIsModuleMenuOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const { askLogout, logoutModal } = useLogoutConfirm();

  const path = usePathname();
  const height = useScreenHeight();
  const width = useScreenWidth();

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const iconSize = (height && height >= 1000) || (width && width > 768) ? 26 : 18;
  const MOBILE_BREAKPOINT = 768;

  const isMobile = width <= MOBILE_BREAKPOINT;

  const project = useStore(useAppStore, (state) => state.selectedProject);
  const {
    setProjectsBasicInfo,
    setSelectedProject,
    setUserId,
    setCurrency,
    setLocale,
    isHy,
    projectsBasicInfo,
    setConfig
  } = useAppStore((state) => state);

  const LOGO = project?.LOGO;
  const projectName = project?.NAME ?? "";

  // Click outside handler to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        isModuleMenuOpen
      ) {
        setIsModuleMenuOpen(false);
      }
    };

    if (isMobile && isModuleMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, isModuleMenuOpen]);

  useEffect(() => {
    setIsComponentLoading(false);
    try {
      setPinned(localStorage.getItem(RAIL_PINNED_KEY) === "1");
    } catch {
      // sin almacenamiento: arranca cerrado
    }
  }, []);

  useEffect(() => {
    //to check if there is a project selected
    //if not it should open the modal to select one
    if (isHy && !isComponentLoading && !project?.ID) {
      setModalProjectSelectorOpen(true);
    }
  }, [isComponentLoading, project]);

  useEffect(() => {
    //useEffect to call userPermissions and get the projects
    const fetchProjects = async () => {
      const response = await getUserPermissions();
      if (response?.data) {
        setProjectsBasicInfo(
          response?.data?.permissions.map((project) => ({
            ID: project.project_id,
            NAME: project.name,
            LOGO: project.logo ? project.logo : "",
            rol_id: project.rol_id,
            views_permissions: project.views_permissions,
            action_permissions: project.action_permissions,
            isSuperAdmin: project.is_super_admin
          }))
        );

        setUserId(response?.data.id_user);
        setCurrency(response?.data.preferences.currency);
        setLocale(response?.data.preferences.id);
        setConfig({ include_iva: false, create_client_btn: false, projectId: 0 }); // Reset config before setting new values

        if (response?.data?.permissions?.length === 1) {
          const project = {
            ID: response?.data.permissions[0].project_id,
            NAME: response?.data.permissions[0].name,
            LOGO: response?.data.permissions[0].logo ? response?.data.permissions[0].logo : "",
            rol_id: response?.data.permissions[0].rol_id,
            views_permissions: response?.data.permissions[0].views_permissions,
            action_permissions: response?.data.permissions[0].action_permissions,
            isSuperAdmin: response?.data.permissions[0].is_super_admin
          };
          setProjectInApi(project.ID);
          setSelectedProject(project);
        }
      }
    };

    if (!projectsBasicInfo?.length && isHy) {
      fetchProjects();
    }
  }, [isHy]);

  const togglePinned = () => {
    const next = !pinned;
    setPinned(next);
    try {
      localStorage.setItem(RAIL_PINNED_KEY, next ? "1" : "0");
    } catch {
      // sin almacenamiento (modo privado): queda fijado solo en esta visita
    }
  };

  return (
    <div className={`sidebar main ${pinned && !isMobile ? "railPinned" : ""}`} ref={mobileMenuRef}>
      {isMobile && (
        <Button
          type="text"
          icon={<List size={iconSize} />}
          className="buttonMenu"
          onClick={() => setIsModuleMenuOpen(!isModuleMenuOpen)}
        />
      )}

      {/* Mobile: Show ModulesButtons only when menu is open */}
      {isMobile && isModuleMenuOpen && (
        <div className="mobileMenuWrapper">
          <ModulesButtons path={path} project={project} isMobileMenu={true} />
        </div>
      )}

      {/* Riel de íconos que se abre encima del contenido al pasar el mouse (o fijado). */}
      <div className="railPanel">
        <Flex vertical className="modulesGroup">
          {/* Proyecto: cuadro de 48×48 sin borde ni sombra con el riel cerrado; abierto, sombra
              sutil y el nombre al lado (una línea si cabe, máximo dos). */}
          <button
            type="button"
            className="logoContainer"
            title="Cambiar proyecto"
            onClick={() => setModalProjectSelectorOpen(true)}
          >
            <span className="logoContainer__tile">
              {LOGO ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={projectName || "Logo del proyecto"}
                  src={`${LOGO.trim()}?v=${new Date().getTime()}`}
                  className="logoContainer__image"
                />
              ) : (
                <Avatar
                  shape="square"
                  className="imageWithoutImage"
                  size={36}
                  icon={<Clipboard />}
                />
              )}
            </span>
            {projectName && <span className="logoContainer__name">{projectName}</span>}
          </button>

          {!isMobile && <ModulesButtons path={path} project={project} isMobileMenu={false} />}
        </Flex>

        {!isMobile && (
          <div className="exit">
            <SettingsRailItem path={path} project={project} />
            <RailItem
              label={pinned ? "Desfijar menú" : "Fijar menú"}
              icon={<RailIcon name={pinned ? "desfijar" : "fijar"} />}
              onClick={togglePinned}
            />
            <RailItem
              label="Cerrar sesión"
              icon={<RailIcon name="cerrarSesion" />}
              onClick={askLogout}
            />
          </div>
        )}
      </div>

      {logoutModal}

      <ModalProjectSelector
        isOpen={modalProjectSelectorOpen}
        onClose={() => setModalProjectSelectorOpen(false)}
      />
    </div>
  );
};
