"use client";

import { Badge } from "@/modules/chat/ui/badge";
import { CaretDoubleRight } from "phosphor-react";
import { IBalance } from "@/types/financialDiscounts/IFinancialDiscounts";

interface BalanceDetailModalProps {
  saldoData: IBalance;
  onBack: () => void;
  isModal?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(amount);

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function BalanceDetailModal({
  saldoData,
  onBack,
  isModal = false
}: BalanceDetailModalProps) {
  return (
    <div className={isModal ? "bg-white" : "min-h-screen bg-white"}>
      {/* Header */}
      <div className={isModal ? "px-6 pt-5 pb-4" : "px-6 lg:px-8 pt-5 pb-4"}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center bg-white border-none cursor-pointer hover:bg-[#f7f7f7]"
            >
              <CaretDoubleRight size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-cashport-black">{saldoData.id}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{saldoData.client_name}</p>
            </div>
          </div>
          <Badge
            className="text-xs px-2.5 py-1 whitespace-nowrap"
            style={{
              backgroundColor: "transparent",
              color: "#000",
              border: "1px solid #d9d9d9"
            }}
          >
            {saldoData.status_name}
          </Badge>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Content */}
      <div className={isModal ? "px-6 py-5" : "px-6 lg:px-8 py-5"}>
        <div className="space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <p className="text-xs text-gray-400">Tipo</p>
              <p className="text-sm font-semibold text-cashport-black">
                {saldoData.motive_name ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">KAM</p>
              <p className="text-sm font-semibold text-cashport-black">{saldoData.kam_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fecha registro</p>
              <p className="text-sm font-semibold text-cashport-black">
                {formatDate(saldoData.balance_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fecha creación</p>
              <p className="text-sm font-semibold text-cashport-black">
                {formatDate(saldoData.created_at)}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Montos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Saldo inicial</p>
              <p className="text-base font-bold text-cashport-black">
                {formatCurrency(saldoData.initial_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Pendiente</p>
              <p className="text-base font-bold text-cashport-black">
                {formatCurrency(saldoData.pending_amount)}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Mock info hardcoded */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Notas de crédito
            </p>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-400 py-2 px-3">
                      ID Nota
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 py-2 px-3">
                      ID Documento
                    </th>
                    <th className="text-right text-xs font-medium text-gray-400 py-2 px-3">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2.5 px-3">
                      <span className="text-sm text-cashport-black">NC-001</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-sm text-gray-500">DOC-12345</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-sm font-medium text-cashport-black">
                        {formatCurrency(500000)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
