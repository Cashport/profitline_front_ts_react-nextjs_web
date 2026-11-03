"use client";

import type { ReactNode } from "react";
import type { Dayjs } from "dayjs";
import { useTranslations } from "use-intl";

import Header from "@/components/organisms/header";

import VisitsDateNav from "../visits-date-nav/visits-date-nav";

interface VisitsHeaderProps {
  day: Dayjs;
  today: Dayjs;
  onDayChange: (day: Dayjs) => void;
  /** A la derecha, antes del tema y el avatar: chips, "Filtrar" y el buscador (DESIGN.md §4). */
  tools?: ReactNode;
}

/**
 * Header compartido de Cashport (docs/DESIGN.md §4): título y día que se mira a la
 * izquierda; filtros, buscador, tema y avatar (cerrar sesión) a la derecha.
 */
export default function VisitsHeader({ day, today, onDayChange, tools }: VisitsHeaderProps) {
  const tv = useTranslations("visits.header");
  return (
    <Header
      title={tv("title")}
      titleExtra={<VisitsDateNav day={day} today={today} onChange={onDayChange} />}
      actionsExtra={<>{tools}</>}
    />
  );
}
