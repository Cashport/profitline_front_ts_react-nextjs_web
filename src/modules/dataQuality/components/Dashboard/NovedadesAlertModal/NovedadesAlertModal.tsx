"use client";

import { Modal } from "antd";
import { AlertTriangle } from "lucide-react";

import { IDashboardSummaryAlert } from "@/types/dataQuality/IDataQuality";

interface NovedadesAlertModalProps {
  alert: IDashboardSummaryAlert | null;
  onClose: () => void;
}

export const NovedadesAlertModal = ({ alert, onClose }: NovedadesAlertModalProps) => {
  return (
    <Modal
      open={!!alert}
      onCancel={onClose}
      footer={null}
      centered
      width={900}
      destroyOnClose
      title={
        alert ? (
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: alert.color + "22" }}
            >
              <AlertTriangle className="w-4 h-4" style={{ color: alert.color }} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold" style={{ color: "#141414" }}>
                {alert.name}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "#888" }}>
                {alert.clients.length} caso{alert.clients.length !== 1 ? "s" : ""} detectado
                {alert.clients.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ) : null
      }
    >
      {alert && (
        <div className="overflow-auto max-h-[480px]">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "#EEEEEE" }}>
                <th
                  className="text-xs font-medium text-left py-2"
                  style={{ color: "#6B7280" }}
                >
                  Cliente
                </th>
              </tr>
            </thead>
            <tbody>
              {alert.clients.length === 0 ? (
                <tr>
                  <td className="text-center text-sm py-8" style={{ color: "#888" }}>
                    No hay registros.
                  </td>
                </tr>
              ) : (
                alert.clients.map((c) => (
                  <tr key={c.id_client} className="border-b" style={{ borderColor: "#F3F3F3" }}>
                    <td className="py-3">
                      <span className="text-sm font-medium" style={{ color: "#141414" }}>
                        {c.client_name}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};
