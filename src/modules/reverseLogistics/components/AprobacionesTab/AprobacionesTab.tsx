"use client";

import { AprobacionesList } from "../AprobacionesList/AprobacionesList";

// Detail is now a separate page at /reverse-logistics/approvals/:id, so the
// tab always renders the list — clicking "Ir a Aprobar" navigates to the
// detail page instead of swapping the list in-place.
export function AprobacionesTab() {
  return <AprobacionesList />;
}
