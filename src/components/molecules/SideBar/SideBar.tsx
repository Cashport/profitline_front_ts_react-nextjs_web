"use client";
import { useEffect, useState, useRef } from "react";
import { Avatar, Button, Flex } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLineRight, Clipboard, List } from "phosphor-react";

import { logOut } from "../../../../firebase-utils";
import { useAppStore } from "@/lib/store/store";
import useStore from "@/lib/hook/useStore";
import { getUserPermissions } from "@/services/permissions/userPermissions";
import { setProjectInApi } from "@/utils/api/api";

import useScreenHeight from "@/components/hooks/useScreenHeight";
import useScreenWidth from "@/components/hooks/useScreenWidth";
import { ModalProjectSelector } from "../modals/ModalProjectSelector/ModalProjectSelector";
import { ModulesButtons } from "@/components/atoms/NavigationBar/ModulesButtons/ModulesButtons";

import "./sidebar.scss";

export const SideBar = () => {
  const [isSideBarLarge, setIsSideBarLarge] = useState(false);
  const [modalProjectSelectorOpen, setModalProjectSelectorOpen] = useState(false);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [isModuleMenuOpen, setIsModuleMenuOpen] = useState(false);

  const router = useRouter();
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

  return (
    <div className={`sidebar ${isSideBarLarge ? "mainLarge" : "main"}`} ref={mobileMenuRef}>
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
          <ModulesButtons
            isSideBarLarge={isSideBarLarge}
            path={path}
            project={project}
            isMobileMenu={true}
          />
        </div>
      )}
      <Flex vertical align="center">
        <button className="logoContainer" onClick={() => setModalProjectSelectorOpen(true)}>
          {LOGO ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="logo company"
              src={`${LOGO.trim()}?v=${new Date().getTime()}`}
              className="logoContainer__image"
            />
          ) : (
            <Avatar shape="square" className="imageWithoutImage" size={50} icon={<Clipboard />} />
          )}
        </button>

        {!isMobile && (
          <ModulesButtons
            isSideBarLarge={isSideBarLarge}
            path={path}
            project={project}
            isMobileMenu={false}
          />
        )}
      </Flex>

      <Flex className="exit">
        <Button
          type="text"
          onClick={() => logOut(router)}
          icon={<ArrowLineRight size={iconSize} />}
          className="buttonExit"
        >
          {isSideBarLarge && "Salir"}
        </Button>
      </Flex>

      <ModalProjectSelector
        isOpen={modalProjectSelectorOpen}
        onClose={() => setModalProjectSelectorOpen(false)}
      />
    </div>
  );
};
