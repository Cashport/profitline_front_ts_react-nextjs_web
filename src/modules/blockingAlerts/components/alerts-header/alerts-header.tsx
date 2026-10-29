"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import Header from "@/components/organisms/header";
import WalletThemeToggle from "@/modules/walletModule/components/wallet-theme-toggle/wallet-theme-toggle";
import { cn } from "@/utils/utils";

export interface AlertsCrumb {
  label: string;
  /** Sin href: es la pantalla actual. */
  href?: string;
}

interface AlertsHeaderProps {
  /** Ruta hasta la pantalla; con una sola miga es el título. */
  crumbs: AlertsCrumb[];
  /** Escritorio: a la derecha del título. Móvil: bajo el título de la pantalla principal. */
  info?: React.ReactNode;
  /** Toggle de tema: solo en el listado general. */
  themeToggle?: boolean;
  /** Escritorio sin sangría izquierda: en el detalle lo de abajo arranca en el borde. */
  flush?: boolean;
}

/**
 * Escritorio: header compartido de Cashport (docs/DESIGN.md §4) con las migas del módulo.
 * Móvil: título (o migas) y el tema en pequeño, sin avatar, como el prototipo.
 */
export default function AlertsHeader({ crumbs, info, themeToggle, flush }: AlertsHeaderProps) {
  const current = crumbs[crumbs.length - 1];

  return (
    <>
      <Header
        className={cn("max-md:!hidden", flush && "!pl-0")}
        title={current.label}
        titleNode={
          crumbs.length > 1 ? (
            <nav aria-label="Ruta" className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
              {crumbs.map((crumb, i) => (
                <Fragment key={crumb.label + i}>
                  {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-cp-ink-4" />}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="min-w-0 max-w-[220px] truncate text-[16px] font-medium text-cp-ink-3 hover:text-cp-ink hover:underline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <h1 className="m-0 min-w-0 truncate text-[16px] font-semibold text-cp-ink">
                      {crumb.label}
                    </h1>
                  )}
                </Fragment>
              ))}
            </nav>
          ) : undefined
        }
        titleExtra={info}
        actionsExtra={themeToggle && <WalletThemeToggle />}
      />

      {/* En móvil el contenedor con scroll tiene 1rem de padding arriba y el sticky lo respeta:
          -top-4 lo pega al borde para que el contenido no asome por encima. */}
      <header className="sticky -top-4 z-20 -mx-4 flex min-h-11 items-center gap-2.5 bg-cp-bg px-4 pb-1 pt-1 md:hidden">
        <div className="min-w-0 flex-1">
          {crumbs.length > 1 ? (
            <nav
              aria-label="Ruta"
              className="flex min-w-0 items-center gap-1 whitespace-nowrap text-[12.5px]"
            >
              {crumbs.map((crumb, i) => (
                <Fragment key={crumb.label + i}>
                  {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-cp-ink-4" />}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="min-w-0 max-w-[38%] shrink truncate font-medium text-cp-ink-3 underline underline-offset-[3px]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <h1 className="m-0 min-w-0 truncate text-[13px] font-semibold text-cp-ink">
                      {crumb.label}
                    </h1>
                  )}
                </Fragment>
              ))}
            </nav>
          ) : (
            <>
              <h1 className="m-0 text-[18px] font-bold leading-tight text-cp-ink">
                {current.label}
              </h1>
              {info && <div className="mt-0.5 text-[12px] font-medium text-cp-ink-3">{info}</div>}
            </>
          )}
        </div>
        {themeToggle && (
          <div className="shrink-0 [--control-h:36px]">
            <WalletThemeToggle />
          </div>
        )}
      </header>
    </>
  );
}
