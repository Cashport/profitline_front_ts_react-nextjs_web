"use client";
import Link from "next/link";
import { checkUserViewPermissions, cn } from "@/utils/utils";
import useScrollFade from "@/components/hooks/useScrollFade";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";

import { ISelectedProject } from "@/lib/slices/createProjectSlice";

import styles from "./ModulesButtons.module.scss";

/* Íconos del riel (diseño "Menu Lateral Cashport" 6e): trazo 1.6, 19px, puntas redondeadas.
   Los cuatro últimos no estaban en el diseño y siguen el mismo estilo. */
export const RAIL_ICON_PATHS = {
  cartera: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6",
  carteraEdad: "M3 6h18v12H3zM7 10h3M7 14h6M15 10h2",
  novedades: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4",
  saldos:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5v1.5M12 16v1.5",
  cuentasMedicas: "M7 3h7l5 5v13H7zM14 3v5h5M11 13h4M13 11v4",
  torreRecaudo: "M3 7h18v10H3zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM6 10v.01M18 14v.01",
  bancos: "M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18",
  marketplace:
    "M4 9l1.5-5h13L20 9M5 9v11h14V9M4 9c0 2.5 4 2.5 4 0 0 2.5 4 2.5 4 0 0 2.5 4 2.5 4 0 0 2.5 4 2.5 4 0",
  ordenesCompra: "M3 4h2l2.5 11h11L21 7H6.5M9 20h.01M18 20h.01",
  visitas:
    "M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  logisticaInversa: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9",
  bots: "M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM12 4v4M9 14h.01M15 14h.01",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  whatsapp: "M21 12a8 8 0 0 1-11.8 7L4 20l1-4.6A8 8 0 1 1 21 12z",
  dataQuality:
    "M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  configuracion:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4",
  fijar: "M9 6l6 6-6 6M4 4v16",
  desfijar: "M15 6l-6 6 6 6M20 4v16",
  cerrarSesion: "M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10",
  aplicacionPagos: "M3 6h18v12H3zM3 10h18M7 15h4",
  aprobaciones: "M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
  tickets: "M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM14 7v10",
  informes: "M3 4h18v12H3zM12 16v4M8 20h8M7 12l3-3 3 2 4-4"
} as const;

export const RailIcon = ({ name }: { name: keyof typeof RAIL_ICON_PATHS }) => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={RAIL_ICON_PATHS[name]} />
  </svg>
);

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
    icon: <RailIcon name="cartera" />,
    visible: can("Clientes"),
    isActive: (p) => p.startsWith("/clientes")
  },
  {
    href: "/wallet",
    label: "Cartera por edad",
    group: "Cartera",
    icon: <RailIcon name="carteraEdad" />,
    visible: can("Wallet"),
    isActive: (p) => p.startsWith("/wallet")
  },
  {
    href: "/novelties",
    label: "Novedades",
    group: "Cartera",
    icon: <RailIcon name="novedades" />,
    visible: can("Novelties"),
    isActive: (p) => p.startsWith("/novelties")
  },
  {
    href: "/balances",
    label: "Saldos",
    group: "Cartera",
    icon: <RailIcon name="saldos" />,
    visible: can("Balances"),
    isActive: (p) => p.startsWith("/balances")
  },
  {
    href: "/cuentas-medicas",
    label: "Cuentas médicas",
    group: "Cartera",
    icon: <RailIcon name="cuentasMedicas" />,
    visible: can("MedicalAccounts"),
    isActive: (p) => p.startsWith("/cuentas-medicas")
  },
  {
    href: "/dashboard",
    label: "Torre de recaudo",
    group: "Recaudo",
    icon: <RailIcon name="torreRecaudo" />,
    visible: can("Dashboard"),
    isActive: (p) => p.startsWith("/dashboard")
  },
  {
    href: "/banco",
    label: "Bancos",
    group: "Recaudo",
    icon: <RailIcon name="bancos" />,
    visible: can("Bancos"),
    isActive: (p) => p === "/banco"
  },
  {
    href: "/applyModule",
    label: "Aplicación de pagos",
    group: "Recaudo",
    icon: <RailIcon name="aplicacionPagos" />,
    visible: (_project, p) => p === "/applyModule",
    isActive: (p) => p === "/applyModule"
  },
  {
    href: "/comercio",
    label: "Marketplace",
    group: "Comercial",
    icon: <RailIcon name="marketplace" />,
    visible: can("Marketplace"),
    isActive: (p) => p.startsWith("/comercio")
  },
  {
    href: "/purchase-orders",
    label: "Órdenes de compra",
    group: "Comercial",
    icon: <RailIcon name="ordenesCompra" />,
    visible: can("PurchaseOrders"),
    isActive: (p) => p.startsWith("/purchase-orders")
  },
  {
    href: "/visits",
    label: "Visitas",
    group: "Comercial",
    icon: <RailIcon name="visitas" />,
    visible: can("Visits"),
    isActive: (p) => p.startsWith("/visits")
  },
  {
    href: "/logistica-inversa",
    label: "Logística inversa",
    group: "Comercial",
    icon: <RailIcon name="logisticaInversa" />,
    visible: can("ReverseLogistics"),
    isActive: (p) => p.startsWith("/logistica-inversa")
  },
  {
    // Salud de Automatizaciones vive bajo Data Quality (no hay permiso propio).
    href: "/data-quality/automations",
    label: "Bots",
    group: "Automatización",
    icon: <RailIcon name="bots" />,
    visible: can("DataQuality"),
    isActive: (p) => p.startsWith("/data-quality/automations")
  },
  {
    href: "/task-manager",
    label: "Mail",
    group: "Automatización",
    icon: <RailIcon name="mail" />,
    visible: can("GestorTareas"),
    isActive: (p) => p === "/task-manager"
  },
  {
    href: "/chat",
    label: "WhatsApp",
    group: "Automatización",
    icon: <RailIcon name="whatsapp" />,
    visible: can("Whatsapp"),
    isActive: (p) => p === "/chat"
  },
  {
    href: "/data-quality",
    label: "Data Quality",
    group: "Automatización",
    icon: <RailIcon name="dataQuality" />,
    visible: can("DataQuality"),
    isActive: (p) => p.startsWith("/data-quality") && !p.startsWith("/data-quality/automations")
  },
  {
    href: "/aprobaciones",
    label: "Aprobaciones",
    group: "Gestión",
    icon: <RailIcon name="aprobaciones" />,
    visible: can("Aprobaciones"),
    isActive: (p) => p === "/aprobaciones"
  },
  {
    href: "/tickets",
    label: "Tickets",
    group: "Gestión",
    icon: <RailIcon name="tickets" />,
    visible: can("Tickets"),
    isActive: (p) => p.startsWith("/tickets")
  },
  {
    href: "/reports",
    label: "Informes",
    group: "Gestión",
    icon: <RailIcon name="informes" />,
    visible: can("Reports"),
    isActive: (p) => p.startsWith("/reports")
  }
];

/** Configuración (administración del market) va fija abajo, junto a "Fijar menú" y "Cerrar sesión". */
const SETTINGS_MODULE: Omit<RailModule, "group"> = {
  href: "/market-admin",
  label: "Configuración",
  icon: <RailIcon name="configuracion" />,
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
  const groups = Array.from(
    visible
      .reduce(
        (acc, m) => acc.set(m.group, [...(acc.get(m.group) ?? []), m]),
        new Map<RailGroup, RailModule[]>()
      )
      .entries()
  );

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
      {/* Un bloque por grupo: título (visible solo con el riel abierto) y sus ítems. Entre
          grupos, una línea que se ve abierto y cerrado (diseño 6e). */}
      {groups.map(([group, modules]) => (
        <section key={group} className={styles.group}>
          <span className={styles.groupTitle}>{group}</span>
          {modules.map((m) => (
            <RailItem
              key={m.href}
              href={m.href}
              label={m.label}
              icon={m.icon}
              active={m.isActive(path)}
              onClick={(e) => handleNavClick(e, m.href)}
            />
          ))}
        </section>
      ))}
      {/* En móvil no está el pie del riel: Configuración va al final de la lista. */}
      {isMobileMenu && <SettingsRailItem path={path} project={project} />}
    </nav>
  );
};
