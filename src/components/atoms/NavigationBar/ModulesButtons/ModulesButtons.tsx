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
  ShoppingCartSimple,
  Database,
  CurrencyCircleDollar,
  Chats
} from "@phosphor-icons/react";

import { checkUserViewPermissions } from "@/utils/utils";
import useScreenHeight from "@/components/hooks/useScreenHeight";
import useScreenWidth from "@/components/hooks/useScreenWidth";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";

import { ISelectedProject } from "@/lib/slices/createProjectSlice";

import styles from "./ModulesButtons.module.scss";

interface ModulesButtonsProps {
  path: string;
  project: ISelectedProject | undefined;
  isMobileMenu?: boolean;
}

export const ModulesButtons = ({
  path,
  project,
  isMobileMenu = false
}: ModulesButtonsProps) => {
  const height = useScreenHeight();
  const width = useScreenWidth();
  const iconSize = (height && height >= 1000) || (width && width > 768) ? 26 : 18;
  const { attemptNavigation } = useUnsavedChanges();

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (attemptNavigation(href)) e.preventDefault();
  };

  return (
    <div className={`${styles.containerButtons} ${isMobileMenu ? styles.mobile : ""}`}>
      {/* Dashboard */}
      {checkUserViewPermissions(project, "Dashboard") && (
        <Link href="/dashboard" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<SquaresFour size={iconSize} />}
            className={path.startsWith("/dashboard") ? styles.buttonIcon : styles.buttonIconActive}
            onClick={(e) => handleNavClick(e, "/dashboard")}
          />
        </Link>
      )}

      {/* Clientes */}
      {checkUserViewPermissions(project, "Clientes") && (
        <Link href="/clientes/all">
          <Button
            type="primary"
            size="large"
            icon={<User size={iconSize} />}
            className={path.startsWith("/clientes") ? styles.buttonIcon : styles.buttonIconActive}
            onClick={(e) => handleNavClick(e, "/clientes/all")}
          />
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
            onClick={(e) => handleNavClick(e, "/descuentos")}
          />
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
            onClick={(e) => handleNavClick(e, "/notificaciones")}
          />
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
            onClick={(e) => handleNavClick(e, "/comercio")}
          />
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
            onClick={(e) => handleNavClick(e, "/banco")}
          />
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
            onClick={(e) => handleNavClick(e, "/settings")}
          />
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
            onClick={(e) => handleNavClick(e, "/proveedores")}
          />
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
            onClick={(e) => handleNavClick(e, "/applyModule")}
          />
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
            onClick={(e) => handleNavClick(e, "/client-management")}
          />
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
            onClick={(e) => handleNavClick(e, "/chat")}
          />
        </Link>
      )}

      {/* Aprobaciones */}
      {checkUserViewPermissions(project, "Aprobaciones") && (
        <Link href="/aprobaciones" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<ListChecks size={iconSize} />}
            className={path === "/aprobaciones" ? styles.buttonIcon : styles.buttonIconActive}
            onClick={(e) => handleNavClick(e, "/aprobaciones")}
          />
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
            onClick={(e) => handleNavClick(e, "/newDashboard")}
          />
        </Link>
      )}

      {/* New Task Manager */}
      {checkUserViewPermissions(project, "GestorTareas") && (
        <Link href="/task-manager" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<ClipboardText size={iconSize} />}
            className={path === "/task-manager" ? styles.buttonIcon : styles.buttonIconActive}
            onClick={(e) => handleNavClick(e, "/task-manager")}
          />
        </Link>
      )}

      {/* Purchase Orders */}
      {checkUserViewPermissions(project, "PurchaseOrders") && (
        <Link href="/purchase-orders" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartSimple size={iconSize} />}
            className={
              path.startsWith("/purchase-orders") ? styles.buttonIcon : styles.buttonIconActive
            }
            onClick={(e) => handleNavClick(e, "/purchase-orders")}
          />
        </Link>
      )}

      {/* Data Quality */}
      {checkUserViewPermissions(project, "DataQuality") && (
        <Link href="/data-quality" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Database size={iconSize} />}
            className={
              path.startsWith("/data-quality") ? styles.buttonIcon : styles.buttonIconActive
            }
            onClick={(e) => handleNavClick(e, "/data-quality")}
          />
        </Link>
      )}
      {/* Balances */}
      {checkUserViewPermissions(project, "Balances") && (
        <Link href="/balances" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<CurrencyCircleDollar size={iconSize} />}
            className={path.startsWith("/balances") ? styles.buttonIcon : styles.buttonIconActive}
            onClick={(e) => handleNavClick(e, "/balances")}
          />
        </Link>
      )}
      {/* Mass Communications */}
      {checkUserViewPermissions(project, "MassCommunications") && (
        <Link href="/mass-communications" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Chats size={iconSize} />}
            className={
              path.startsWith("/mass-communications") ? styles.buttonIcon : styles.buttonIconActive
            }
            onClick={(e) => handleNavClick(e, "/mass-communications")}
          />
        </Link>
      )}
    </div>
  );
};
