"use client";
import { Button } from "antd";
import Link from "next/link";
import {
  BellSimpleRinging,
  Gear,
  User,
  Bank,
  SquaresFour,
  Storefront,
  UsersFour,
  Stack,
  ClipboardText,
  ListChecks
} from "phosphor-react";
import {
  ChatCircleDots,
  SealPercent,
  HandTap,
  ChartBar,
  CheckSquareOffset
} from "@phosphor-icons/react";

import { checkUserViewPermissions } from "@/utils/utils";
import useScreenHeight from "@/components/hooks/useScreenHeight";
import useScreenWidth from "@/components/hooks/useScreenWidth";

import { ISelectedProject } from "@/lib/slices/createProjectSlice";

import styles from "./ModulesButtons.module.scss";

interface ModulesButtonsProps {
  isSideBarLarge: boolean;
  path: string;
  project: ISelectedProject | undefined;
  isMobileMenu?: boolean;
}

export const ModulesButtons = ({
  isSideBarLarge,
  path,
  project,
  isMobileMenu = false
}: ModulesButtonsProps) => {
  const height = useScreenHeight();
  const width = useScreenWidth();
  const iconSize = (height && height >= 1000) || (width && width > 768) ? 26 : 18;

  return (
    <div className={`${styles.containerButtons} ${isMobileMenu ? styles.mobile : ""}`}>
      {/* Dashboard */}
      <Link href="/dashboard" passHref legacyBehavior>
        <Button
          type="primary"
          size="large"
          icon={<SquaresFour size={iconSize} />}
          className={path.startsWith("/dashboard") ? styles.buttonIcon : styles.buttonIconActive}
        >
          {isSideBarLarge && "Dashboard"}
        </Button>
      </Link>

      {/* Clientes */}
      {checkUserViewPermissions(project, "Clientes") && (
        <Link href="/clientes/all">
          <Button
            type="primary"
            size="large"
            icon={<User size={iconSize} />}
            className={path.startsWith("/clientes") ? styles.buttonIcon : styles.buttonIconActive}
          >
            {isSideBarLarge && "Clientes"}
          </Button>
        </Link>
      )}

      {/* Descuentos */}
      {checkUserViewPermissions(project, "Descuentos") && (
        <Link href="/descuentos" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<SealPercent size={iconSize} />}
            className={path.startsWith("/descuentos") ? styles.buttonIcon : styles.buttonIconActive}
          >
            {isSideBarLarge && "Descuentos"}
          </Button>
        </Link>
      )}

      {/* Notificaciones */}
      {checkUserViewPermissions(project, "Notificaciones") && (
        <Link href="/notificaciones" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<BellSimpleRinging size={iconSize} />}
            className={
              path.startsWith("/notificaciones") ? styles.buttonIcon : styles.buttonIconActive
            }
          >
            {isSideBarLarge && "Notificaciones"}
          </Button>
        </Link>
      )}

      {/* Marketplace / Comercio */}
      {checkUserViewPermissions(project, "Marketplace") && (
        <Link href="/comercio" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Storefront size={iconSize} />}
            className={path.startsWith("/comercio") ? styles.buttonIcon : styles.buttonIconActive}
          >
            {isSideBarLarge && "Comercio"}
          </Button>
        </Link>
      )}

      {/* Bancos */}
      {checkUserViewPermissions(project, "Bancos") && (
        <Link href="/banco" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Bank size={iconSize} />}
            className={path === "/banco" ? styles.buttonIcon : styles.buttonIconActive}
          >
            {isSideBarLarge && "Bancos"}
          </Button>
        </Link>
      )}

      {/* Configuración / Settings */}
      {checkUserViewPermissions(project, "Configuracion") && (
        <Link href="/settings" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Gear size={iconSize} />}
            className={
              path === "/settings" || path.startsWith("/proyectos/review")
                ? styles.buttonIcon
                : styles.buttonIconActive
            }
          >
            {isSideBarLarge && "Configuración"}
          </Button>
        </Link>
      )}

      {/* Proveedores */}
      {checkUserViewPermissions(project, "Proveedores") && (
        <Link href="/proveedores" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<UsersFour size={iconSize} />}
            className={
              path === "/proveedores" || path.startsWith("/proveedores")
                ? styles.buttonIcon
                : styles.buttonIconActive
            }
          >
            {isSideBarLarge && "Proveedores"}
          </Button>
        </Link>
      )}

      {/* Gestor de Tareas */}
      {checkUserViewPermissions(project, "GestorTareas") && (
        <Link href="/gestor-tareas" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<ClipboardText size={iconSize} />}
            className={path === "/gestor-tareas" ? styles.buttonIcon : styles.buttonIconActive}
          >
            {isSideBarLarge && "Tareas"}
          </Button>
        </Link>
      )}

      {/* Apply Module */}
      {path === "/applyModule" && (
        <Link href="/applyModule" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<HandTap size={iconSize} />}
            className={path === "/applyModule" ? styles.buttonIcon : styles.buttonIconActive}
          >
            {isSideBarLarge && "Apply"}
          </Button>
        </Link>
      )}

      {/* Administración de Clientes */}
      {checkUserViewPermissions(project, "AdministracionClientes") && (
        <Link href="/client-management" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Stack size={iconSize} />}
            className={path === "/client-management" ? styles.buttonIcon : styles.buttonIconActive}
          >
            {isSideBarLarge && "Admin Clientes"}
          </Button>
        </Link>
      )}

      {/* Chat */}
      {checkUserViewPermissions(project, "Whatsapp") && (
        <Link href="/chat" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<ChatCircleDots size={iconSize} />}
            className={path === "/chat" ? styles.buttonIcon : styles.buttonIconActive}
          >
            {isSideBarLarge && "Chat"}
          </Button>
        </Link>
      )}

      {/* Aprobaciones */}
      {false && (
        <Link href="/aprobaciones" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<ListChecks size={iconSize} />}
            className={path === "/aprobaciones" ? styles.buttonIcon : styles.buttonIconActive}
          >
            {isSideBarLarge && "Aprobaciones"}
          </Button>
        </Link>
      )}

      {/* New Dashboard */}
      {false && (
        <Link href="/newDashboard" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<ChartBar size={iconSize} />}
            className={path === "/newDashboard" ? styles.buttonIcon : styles.buttonIconActive}
          >
            {isSideBarLarge && "New Dashboard"}
          </Button>
        </Link>
      )}

      {/* New Task Manager */}
      {checkUserViewPermissions(project, "TaskManager") && (
        <Link href="/task-manager" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<CheckSquareOffset size={iconSize} />}
            className={path === "/task-manager" ? styles.buttonIcon : styles.buttonIconActive}
          >
            {isSideBarLarge && "Task Manager"}
          </Button>
        </Link>
      )}
    </div>
  );
};
