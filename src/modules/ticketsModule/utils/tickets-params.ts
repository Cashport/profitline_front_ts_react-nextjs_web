import type { TicketFilters } from "../types";

/**
 * Query string de los filtros comunes a /tickets y /tickets/summary. Un solo
 * armador para que la lista y las tarjetas no puedan filtrar distinto.
 */
export function buildTicketFilterParams(filters: TicketFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.assignedToUserId) params.set("assigned_to_user_id", String(filters.assignedToUserId));
  if (filters.categoryId) params.set("category_id", String(filters.categoryId));
  const term = filters.search?.trim();
  if (term) params.set("search", term);

  return params;
}
