"use client";

import { PasteConcilationTable } from "@/components/molecules/tables/ConcilationTables/PasteConcilationTable/PasteConcilationTable";
import { StateConcilationTable } from "@/components/molecules/tables/ConcilationTables/StateConcilationTable/StateConcilationTable";
import { InfoConcilation } from "@/types/concilation/concilation";
import { extractSingleParam } from "@/utils/utils";
import { useParams } from "next/navigation";
import { useState } from "react";

export const MassConcilationView = () => {
  const [currentView, setCurrentView] = useState<"paste" | "state">("paste");
  const [invoices, setInvoices] = useState<InfoConcilation | undefined>(undefined);
  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const clientId = clientIdParam || "";

  return (
    <div>
      {currentView === "paste" ? (
        <PasteConcilationTable
          setCurrentView={setCurrentView}
          setInvoices={setInvoices}
          invoices={invoices}
          clientId={clientId}
        />
      ) : (
        <StateConcilationTable invoices={invoices} clientId={clientId} setInvoices={setInvoices} />
      )}
    </div>
  );
};
