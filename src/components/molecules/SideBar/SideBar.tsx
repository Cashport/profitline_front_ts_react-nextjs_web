"use client";
import { useEffect, useState } from "react";
import { Avatar, Button, Flex } from "antd";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLineRight,
  BellSimpleRinging,
  Gear,
  Megaphone,
  User,
  Clipboard,
  Bank
} from "phosphor-react";

import { logOut } from "../../../../firebase-utils";
import { useAppStore } from "@/lib/store/store";
import useStore from "@/lib/hook/useStore";
import { getUserPermissions } from "@/services/permissions/userPermissions";
import { checkUserViewPermissions } from "@/utils/utils";

import { ModalProjectSelector } from "../modals/ModalProjectSelector/ModalProjectSelector";

import "./sidebar.scss";

export const SideBar = () => {
  const [isSideBarLarge, setIsSideBarLarge] = useState(false);
  const [modalProjectSelectorOpen, setModalProjectSelectorOpen] = useState(false);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const router = useRouter();
  const path = usePathname();
  const project = useStore(useAppStore, (state) => state.selectedProject);
  const setProjectsBasicInfo = useAppStore((state) => state.setProjectsBasicInfo);
  const setSelectedProject = useAppStore((state) => state.setSelectedProject);

  const LOGO = project?.LOGO;

  useEffect(() => {
    setIsComponentLoading(false);
  }, []);

  useEffect(() => {
    //to check if there is a project selected
    //if not it should open the modal to select one
    if (!isComponentLoading && !project?.ID) {
      setModalProjectSelectorOpen(true);
    }
  }, [isComponentLoading, project]);

  useEffect(() => {
    //useEffect to call userPermissions and get the projects
    const fetchProjects = async () => {
      const response = await getUserPermissions();
      setProjectsBasicInfo(
        response?.data?.permissions.map((project) => ({
          ID: project.project_id,
          NAME: project.name,
          LOGO: project.logo ? `${project.logo.trim()}?v=${new Date().getTime()}` : "",
          views_permissions: project.views_permissions,
          action_permissions: project.action_permissions,
          isSuperAdmin: project.is_super_admin
        }))
      );

      if (response?.data?.permissions?.length === 1) {
        setSelectedProject({
          ID: response?.data.permissions[0].project_id,
          NAME: response?.data.permissions[0].name,
          LOGO: response?.data.permissions[0].logo ? response?.data.permissions[0].logo : "",
          views_permissions: response?.data.permissions[0].views_permissions,
          action_permissions: response?.data.permissions[0].action_permissions,
          isSuperAdmin: response?.data?.permissions[0].is_super_admin
        });
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className={isSideBarLarge ? "mainLarge" : "main"}>
      <Flex vertical className="containerButtons">
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
        {checkUserViewPermissions(project, "Clientes") && (
          <Link href="/clientes/all">
            <Button
              type="primary"
              size="large"
              icon={<User size={26} />}
              className={path.startsWith("/clientes") ? "buttonIcon" : "buttonIconActive"}
            >
              {isSideBarLarge && "Clientes"}
            </Button>
          </Link>
        )}
        {checkUserViewPermissions(project, "Descuentos") && (
          <Link href="/descuentos" passHref legacyBehavior>
            <Button
              type="primary"
              size="large"
              icon={<BellSimpleRinging size={26} />}
              className={path.startsWith("/descuentos") ? "buttonIcon" : "buttonIconActive"}
            >
              {isSideBarLarge && "Descuentos"}
            </Button>
          </Link>
        )}
        {checkUserViewPermissions(project, "Notificaciones") && (
          <Link href="/notificaciones" passHref legacyBehavior>
            <Button
              type="primary"
              size="large"
              icon={<BellSimpleRinging size={26} />}
              className={path.startsWith("/notificaciones") ? "buttonIcon" : "buttonIconActive"}
            >
              {isSideBarLarge && "Notificaciones"}
            </Button>
          </Link>
        )}

        {checkUserViewPermissions(project, "Marketplace") && (
          <Link href="/comercio" passHref legacyBehavior>
            <Button
              type="primary"
              size="large"
              icon={<Megaphone size={26} />}
              className={path.startsWith("/comercio") ? "buttonIcon" : "buttonIconActive"}
            >
              {isSideBarLarge && "Descuentos"}
            </Button>
          </Link>
        )}

        {checkUserViewPermissions(project, "Bancos") && (
          <Link href="/banco" passHref legacyBehavior>
            <Button
              type="primary"
              size="large"
              icon={<Bank size={26} />}
              className={path === "/banco" ? "buttonIcon" : "buttonIconActive"}
            >
              {isSideBarLarge && "Bancos"}
            </Button>
          </Link>
        )}

        {checkUserViewPermissions(project, "Configuracion") && (
          <Link href="/" passHref legacyBehavior>
            <Button
              type="primary"
              size="large"
              icon={<Gear size={26} />}
              className={
                path === "/" || path.startsWith("/proyectos/review")
                  ? "buttonIcon"
                  : "buttonIconActive"
              }
            >
              {isSideBarLarge && "Ajustes"}
            </Button>
          </Link>
        )}
      </Flex>
      <Flex className="exit">
        <Button
          type="text"
          size="large"
          onClick={() => logOut(router)}
          icon={<ArrowLineRight size={26} />}
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
