"use client";
import { useEffect, useState } from "react";
import { Avatar, Button, Flex } from "antd";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLineRight,
  BellSimpleRinging,
  Gear,
  User,
  Clipboard,
  Bank,
  SquaresFour,
  Storefront,
  UsersFour,
  Stack,
  ClipboardText
} from "phosphor-react";

import { logOut } from "../../../../firebase-utils";
import { useAppStore } from "@/lib/store/store";
import useStore from "@/lib/hook/useStore";
import { getUserPermissions } from "@/services/permissions/userPermissions";
import { checkUserViewPermissions } from "@/utils/utils";

import { ModalProjectSelector } from "../modals/ModalProjectSelector/ModalProjectSelector";

import "./sidebar.scss";
import { SealPercent } from "@phosphor-icons/react";
import { setProjectInApi } from "@/utils/api/api";
import useScreenHeight from "@/components/hooks/useScreenHeight";

export const SideBar = () => {
  const [isSideBarLarge, setIsSideBarLarge] = useState(false);
  const [modalProjectSelectorOpen, setModalProjectSelectorOpen] = useState(false);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const router = useRouter();
  const path = usePathname();
  const height = useScreenHeight();
  const STANDARD_LOGO_SIZE = 26;
  const SMALL_LOGO_SIZE = 23;

  const project = useStore(useAppStore, (state) => state.selectedProject);
  const {
    setProjectsBasicInfo,
    setSelectedProject,
    setUserId,
    setCurrency,
    setLocale,
    isHy,
    projectsBasicInfo
  } = useAppStore((state) => state);

  const LOGO = project?.LOGO;

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
    <div className={isSideBarLarge ? "mainLarge" : "main"}>
      <Flex vertical className="topNavBar">
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

        <Flex vertical className="containerButtons">
          <Link href="/dashboard" passHref legacyBehavior>
            <Button
              type="primary"
              size="large"
              icon={<SquaresFour size={height < 600 ? SMALL_LOGO_SIZE : STANDARD_LOGO_SIZE} />}
              className={path.startsWith("/dashboard") ? "buttonIcon" : "buttonIconActive"}
            >
              {isSideBarLarge && "Dashboard"}
            </Button>
          </Link>

          {checkUserViewPermissions(project, "Clientes") && (
            <Link href="/clientes/all">
              <Button
                type="primary"
                size="large"
                icon={<User size={height < 600 ? SMALL_LOGO_SIZE : STANDARD_LOGO_SIZE} />}
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
                icon={<SealPercent size={height < 600 ? SMALL_LOGO_SIZE : STANDARD_LOGO_SIZE} />}
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
                icon={
                  <BellSimpleRinging size={height < 600 ? SMALL_LOGO_SIZE : STANDARD_LOGO_SIZE} />
                }
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
                icon={<Storefront size={height < 600 ? SMALL_LOGO_SIZE : STANDARD_LOGO_SIZE} />}
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
                icon={<Bank size={height < 600 ? SMALL_LOGO_SIZE : STANDARD_LOGO_SIZE} />}
                className={path === "/banco" ? "buttonIcon" : "buttonIconActive"}
              >
                {isSideBarLarge && "Bancos"}
              </Button>
            </Link>
          )}

          {checkUserViewPermissions(project, "Configuracion") && (
            <Link href="/settings" passHref legacyBehavior>
              <Button
                type="primary"
                size="large"
                icon={<Gear size={height < 600 ? SMALL_LOGO_SIZE : STANDARD_LOGO_SIZE} />}
                className={
                  path === "/settings" || path.startsWith("/proyectos/review")
                    ? "buttonIcon"
                    : "buttonIconActive"
                }
              >
                {isSideBarLarge && "Ajustes"}
              </Button>
            </Link>
          )}
          {checkUserViewPermissions(project, "Proveedores") && (
            <Link href="/proveedores" passHref legacyBehavior>
              <Button
                type="primary"
                size="large"
                icon={<UsersFour size={height < 600 ? SMALL_LOGO_SIZE : STANDARD_LOGO_SIZE} />}
                className={
                  path === "/proveedores" || path.startsWith("/proveedores")
                    ? "buttonIcon"
                    : "buttonIconActive"
                }
              >
                {isSideBarLarge && "Ajustes"}
              </Button>
            </Link>
          )}
          {checkUserViewPermissions(project, "GestorTareas") && (
            <Link href="/gestor-tareas" passHref legacyBehavior>
              <Button
                type="primary"
                size="large"
                icon={<ClipboardText size={height < 600 ? SMALL_LOGO_SIZE : STANDARD_LOGO_SIZE} />}
                className={path === "/gestor-tareas" ? "buttonIcon" : "buttonIconActive"}
              >
                {isSideBarLarge && "Gestor de tareas"}
              </Button>
            </Link>
          )}
          {checkUserViewPermissions(project, "AdministracionClientes") && (
            <Link href="/client-management" passHref legacyBehavior>
              <Button
                type="primary"
                size="large"
                icon={<Stack size={height < 600 ? SMALL_LOGO_SIZE : STANDARD_LOGO_SIZE} />}
                className={path === "/client-management" ? "buttonIcon" : "buttonIconActive"}
              >
                {isSideBarLarge && "Ajustes"}
              </Button>
            </Link>
          )}
        </Flex>
      </Flex>
      <Flex className="exit">
        <Button
          type="text"
          size="large"
          onClick={() => logOut(router)}
          icon={<ArrowLineRight size={height < 600 ? SMALL_LOGO_SIZE : STANDARD_LOGO_SIZE} />}
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
