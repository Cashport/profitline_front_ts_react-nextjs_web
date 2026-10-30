"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import UserMenu from "@/components/organisms/header/user-menu/user-menu";

interface SurveyPageHeaderProps {
  backHref: string;
  backLabel: string;
  /** Intercepta la vuelta (p. ej. cambios sin publicar); sin él navega el enlace. */
  onBack?: () => void;
  title: React.ReactNode;
  /** Junto al título, como el estado de la encuesta. */
  titleExtra?: React.ReactNode;
  actions?: React.ReactNode;
}

/** Encabezado del detalle y de las respuestas: volver, título y acciones, como el detalle de Informes. */
export default function SurveyPageHeader({
  backHref,
  backLabel,
  onBack,
  title,
  titleExtra,
  actions
}: SurveyPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3.5 pb-3 max-[768px]:px-2">
      <Link
        href={backHref}
        title={`Volver a ${backLabel}`}
        onClick={
          onBack
            ? (e) => {
                e.preventDefault();
                onBack();
              }
            : undefined
        }
        className="flex min-w-0 max-w-[260px] shrink-0 items-center gap-1 text-sm text-[#666666] transition-colors hover:text-[#141414]"
      >
        <ChevronLeft className="h-4 w-4 shrink-0" />
        <span className="truncate">{backLabel}</span>
      </Link>

      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <h1 className="truncate text-[18px] font-semibold text-foreground">{title}</h1>
        {titleExtra}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {actions}
        <UserMenu />
      </div>
    </header>
  );
}
