import { ClaimStatus } from "@/types/claims/IClaims";

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  ready_for_payment: "Lista para pago",
  in_dispute: "En disputa",
  with_observations: "Con novedad",
  responded: "Contestada",
  accepted: "Aceptada"
};

export const CLAIM_STATUS_META: Record<ClaimStatus, { bg: string; text: string; dot: string }> = {
  ready_for_payment: { bg: "rgba(22,163,74,0.12)", text: "#16a34a", dot: "#16a34a" },
  in_dispute: { bg: "rgba(220,38,38,0.12)", text: "#dc2626", dot: "#dc2626" },
  with_observations: { bg: "rgba(217,119,6,0.14)", text: "#d97706", dot: "#d97706" },
  responded: { bg: "rgba(37,99,235,0.12)", text: "#2563eb", dot: "#2563eb" },
  accepted: { bg: "rgba(22,163,74,0.12)", text: "#16a34a", dot: "#16a34a" }
};

/** Neutral styling for a status the backend adds after this list was written */
export const FALLBACK_STATUS_META = { bg: "#f3f4f6", text: "#6b7280", dot: "#6b7280" };

export const CLAIM_STATUSES = Object.keys(CLAIM_STATUS_LABELS) as ClaimStatus[];

export const CLAIM_STATUS_OPTIONS = CLAIM_STATUSES.map((status) => ({
  value: status,
  label: CLAIM_STATUS_LABELS[status]
}));

export const DEFAULT_CLAIM_STATUS: ClaimStatus = "in_dispute";

export const DATE_FORMAT = "DD/MM/YYYY";

/** What the API expects for claim_date / response_date */
export const API_DATE_FORMAT = "YYYY-MM-DD";
