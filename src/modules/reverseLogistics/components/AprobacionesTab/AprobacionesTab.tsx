"use client";

import { useState } from "react";
import { IApproval } from "@/types/reverseLogistics/IReverseLogistics";
import { AprobacionesList } from "../AprobacionesList/AprobacionesList";
import { AprobacionDetalle } from "../AprobacionDetalle/AprobacionDetalle";

// Owns the list <-> detail switch for the Aprobaciones tab. List and detail are
// separate components; picking an approval swaps to the detail, "Regresar" swaps back.
export function AprobacionesTab() {
  const [activeApproval, setActiveApproval] = useState<IApproval | null>(null);

  if (activeApproval) {
    return <AprobacionDetalle approval={activeApproval} onBack={() => setActiveApproval(null)} />;
  }

  return <AprobacionesList onSelect={setActiveApproval} />;
}
