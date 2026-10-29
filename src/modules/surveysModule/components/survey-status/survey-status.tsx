"use client";

import StatusPill from "@/modules/visitsModule/components/shared/status-pill";
import type { IVisitFormStatus } from "@/types/surveys/ISurveys";

import { STATUS_COLORS } from "../../constants";
import { useVisitFormStatuses } from "../../hooks/useVisitFormCatalogs";

/** Estado de la encuesta: el nombre sale del catálogo del backend y el color, del módulo. */
export default function SurveyStatus({ status }: { status: IVisitFormStatus }) {
  const statuses = useVisitFormStatuses();
  const name = statuses.find((s) => s.code === status)?.name ?? status;

  return <StatusPill label={name} color={STATUS_COLORS[status]} />;
}
