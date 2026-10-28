"use client";
import { Fragment } from "react";
import Link from "next/link";
import {
  User,
  Bank,
  Storefront,
  Envelope,
  Gear,
  ListChecks,
  Money,
  Package,
  BellRinging,
  Ticket
} from "phosphor-react";
import {
  ChatCircleDots,
  HandTap,
  Robot,
  ShoppingCartSimple,
  Database,
  CurrencyCircleDollar,
  Invoice,
  LockKey,
  MapPin,
  PresentationChart
} from "@phosphor-icons/react";
import { FileHeart } from "lucide-react";

import { checkUserViewPermissions, cn } from "@/utils/utils";
import useScrollFade from "@/components/hooks/useScrollFade";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";

import { ISelectedProject } from "@/lib/slices/createProjectSlice";

import styles from "./ModulesButtons.module.scss";

const ICON_SIZE = 20;

interface ModulesButtonsProps {
  path: string;
  project: ISelectedProject | undefined;
  isMobileMenu?: boolean;
}

type RailGroup = "Cartera" | "Recaudo" | "Comercial" | "Automatización" | "Gestión";

interface RailModule {
  href: string;
  label: string;
  group: RailGroup;
  icon: React.ReactNode;
  visible: (project: ISelectedProject | undefined, path: string) => boolean;
  isActive: (path: string) => boolean;
}

const can = (view: string) => (project: ISelectedProject | undefined) =>
  checkUserViewPermissions(project, view);

/* Agrupados por etapa del flujo (opción 1e de "Menu Lateral Opciones"); los grupos salen
   en el orden de este arreglo. Descuentos, Notificaciones, Configuración, Proveedores,
   Administración de clientes, Comunicaciones masivas, Torre de control y el dashboard
   nuevo están desactivados en el menú. */
const MODULES: RailModule[] = [
  {
    href: "/clientes/all",
    label: "Cartera",
    group: "Cartera",
    icon: <User size={ICON_SIZE} />,
    visible: can("Clientes"),
    isActive: (p) => p.startsWith("/clientes")
  },
  {
    href: "/wallet",
    label: "Cartera por edad",
    group: "Cartera",
    icon: <Invoice size={ICON_SIZE} />,
    visible: can("Wallet"),
    isActive: (p) => p.startsWith("/wallet")
  },
  {
    href: "/novelties",
    label: "Novedades",
    group: "Cartera",
    icon: <BellRinging size={ICON_SIZE} />,
    visible: can("Novelties"),
    isActive: (p) => p.startsWith("/novelties")
  },
  {
    href: "/balances",
    label: "Saldos",
    group: "Cartera",
    icon: <CurrencyCircleDollar size={ICON_SIZE} />,
    visible: can("Balances"),
    isActive: (p) => p.startsWith("/balances")
  },
  {
    href: "/blockingAlerts",
    label: "Alertas de bloqueo",
    group: "Cartera",
    icon: <LockKey size={ICON_SIZE} />,
    visible: can("BlockingAlerts"),
    isActive: (p) => p.startsWith("/blockingAlerts")
  },
  {
    href: "/cuentas-medicas",
    label: "Cuentas médicas",
    group: "Cartera",
    icon: <FileHeart size={ICON_SIZE} strokeWidth={1.7} />,
    visible: can("MedicalAccounts"),
    isActive: (p) => p.startsWith("/cuentas-medicas")
  },
  {
    href: "/dashboard",
    label: "Torre de recaudo",
    group: "Recaudo",
    icon: <Money size={ICON_SIZE} />,
    visible: can("Dashboard"),
    isActive: (p) => p.startsWith("/dashboard")
  },
  {
    href: "/banco",
    label: "Bancos",
    group: "Recaudo",
    icon: <Bank size={ICON_SIZE} />,
    visible: can("Bancos"),
    isActive: (p) => p === "/banco"
  },
  {
    href: "/applyModule",
    label: "Aplicación de pagos",
    group: "Recaudo",
    icon: <HandTap size={ICON_SIZE} />,
    visible: (_project, p) => p === "/applyModule",
    isActive: (p) => p === "/applyModule"
  },
  {
    href: "/comercio",
    label: "Marketplace",
    group: "Comercial",
    icon: <Storefront size={ICON_SIZE} />,
    visible: can("Marketplace"),
    isActive: (p) => p.startsWith("/comercio")
  },
  {
    href: "/purchase-orders",
    label: "Órdenes de compra",
    group: "Comercial",
    icon: <ShoppingCartSimple size={ICON_SIZE} />,
    visible: can("PurchaseOrders"),
    isActive: (p) => p.startsWith("/purchase-orders")
  },
  {
    href: "/visits",
    label: "Visitas",
    group: "Comercial",
    icon: <MapPin size={ICON_SIZE} />,
    visible: can("Visits"),
    isActive: (p) => p.startsWith("/visits")
  },
  {
    href: "/logistica-inversa",
    label: "Logística inversa",
    group: "Comercial",
    icon: <Package size={ICON_SIZE} />,
    visible: can("ReverseLogistics"),
    isActive: (p) => p.startsWith("/logistica-inversa")
  },
  {
    // Salud de Automatizaciones vive bajo Data Quality (no hay permiso propio).
    href: "/data-quality/automations",
    label: "Bots",
    group: "Automatización",
    icon: <Robot size={ICON_SIZE} />,
    visible: can("DataQuality"),
    isActive: (p) => p.startsWith("/data-quality/automations")
  },
  {
    href: "/task-manager",
    label: "Mail",
    group: "Automatización",
    icon: <Envelope size={ICON_SIZE} />,
    visible: can("GestorTareas"),
    isActive: (p) => p === "/task-manager"
  },
  {
    href: "/chat",
    label: "WhatsApp",
    group: "Automatización",
    icon: <ChatCircleDots size={ICON_SIZE} />,
    visible: can("Whatsapp"),
    isActive: (p) => p === "/chat"
  },
  {
    href: "/data-quality",
    label: "Data Quality",
    group: "Automatización",
    icon: <Database size={ICON_SIZE} />,
    visible: can("DataQuality"),
    isActive: (p) => p.startsWith("/data-quality") && !p.startsWith("/data-quality/automations")
  },
  {
    href: "/aprobaciones",
    label: "Aprobaciones",
    group: "Gestión",
    icon: <ListChecks size={ICON_SIZE} />,
    visible: can("Aprobaciones"),
    isActive: (p) => p === "/aprobaciones"
  },
  {
    href: "/tickets",
    label: "Tickets",
    group: "Gestión",
    icon: <Ticket size={ICON_SIZE} />,
    visible: can("Tickets"),
    isActive: (p) => p.startsWith("/tickets")
  },
  {
    href: "/reports",
    label: "Informes",
    group: "Gestión",
    icon: <PresentationChart size={ICON_SIZE} />,
    visible: can("Reports"),
    isActive: (p) => p.startsWith("/reports")
  }
];

/** Configuración (administración del market) va fija abajo, junto a "Fijar abierto" y "Cerrar sesión". */
const SETTINGS_MODULE: Omit<RailModule, "group"> = {
  href: "/market-admin",
  label: "Configuración",
  icon: <Gear size={ICON_SIZE} />,
  visible: can("MarketAdmin"),
  isActive: (p) =>
    p.startsWith("/market-admin") ||
    p.startsWith("/settings") ||
    p.startsWith("/mass-communications")
};

interface RailItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Ítem del riel: el ícono queda fijo en su cuadro (no se mueve al abrir) y el nombre solo
 * se ve con el riel abierto, al pasar el mouse o fijado (ver sidebar.scss).
 */
export const RailItem = ({ label, icon, active, href, onClick }: RailItemProps) => {
  const className = cn(styles.railItem, active && styles.active);
  const content = (
    <>
      <span className={styles.railIcon}>{icon}</span>
      <span className={styles.railLabel}>{label}</span>
    </>
  );

  return href ? (
    <Link href={href} className={className} aria-label={label} onClick={onClick}>
      {content}
    </Link>
  ) : (
    <button type="button" className={className} aria-label={label} onClick={onClick}>
      {content}
    </button>
  );
};

/** "Configuración" fija al pie del riel; no se muestra sin el permiso de administración. */
export const SettingsRailItem = ({ path, project }: Omit<ModulesButtonsProps, "isMobileMenu">) => {
  const { attemptNavigation } = useUnsavedChanges();
  if (!SETTINGS_MODULE.visible(project, path)) return null;
  return (
    <RailItem
      href={SETTINGS_MODULE.href}
      label={SETTINGS_MODULE.label}
      icon={SETTINGS_MODULE.icon}
      active={SETTINGS_MODULE.isActive(path)}
      onClick={(e) => {
        if (attemptNavigation(SETTINGS_MODULE.href)) e.preventDefault();
      }}
    />
  );
};

export const ModulesButtons = ({ path, project, isMobileMenu = false }: ModulesButtonsProps) => {
  const { attemptNavigation } = useUnsavedChanges();
  // the mobile dropdown lays out in a row and never scrolls, so it needs no fade
  const { ref: containerRef, fade } = useScrollFade<HTMLDivElement>(!isMobileMenu);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (attemptNavigation(href)) e.preventDefault();
  };

  const visible = MODULES.filter((m) => m.visible(project, path));

  return (
    <nav
      ref={containerRef}
      className={cn(
        styles.containerButtons,
        isMobileMenu && styles.mobile,
        fade.top && styles.fadeTop,
        fade.bottom && styles.fadeBottom
      )}
    >
      {visible.map((m, i) => (
        <Fragment key={m.href}>
          {m.group !== visible[i - 1]?.group && (
            <div className={cn(styles.groupHead, i === 0 && styles.first)}>
              <span className={styles.groupTitle}>{m.group}</span>
            </div>
          )}
          <RailItem
            href={m.href}
            label={m.label}
            icon={m.icon}
            active={m.isActive(path)}
            onClick={(e) => handleNavClick(e, m.href)}
          />
        </Fragment>
      ))}
      {/* En móvil no está el pie del riel: Configuración va al final de la lista. */}
      {isMobileMenu && <SettingsRailItem path={path} project={project} />}
    </nav>
  );
};
