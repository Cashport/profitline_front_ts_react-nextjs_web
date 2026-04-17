"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Table, Dropdown, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { Eye, MoreHorizontal, Trash2, Users, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import ModalDetailClientCommunication from "../ModalDetailClientCommunication/ModalDetailClientCommunication";
import { IPreviewClient } from "@/types/communications/ICommunications";
import { removeClientFromCircularization } from "@/services/communications/communications";

interface TableMassCommunicationsProps {
  clients: IPreviewClient[];
  onPreviewClient?: (client: IPreviewClient) => void;
  onClientRemoved?: () => void;
  loading?: boolean;
}

export default function TableMassCommunications({
  clients,
  onPreviewClient,
  onClientRemoved,
  loading
}: TableMassCommunicationsProps) {
  const { communicationId } = useParams<{ communicationId: string }>();
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [sendSuccess] = useState(false);
  const [emailModalClientId, setEmailModalClientId] = useState<string | null>(null);
  const [isRemovingClient, setIsRemovingClient] = useState(false);

  const handleSend = () => console.log("Send communication");
  const handlePreviewClient = (client: IPreviewClient) => {
    onPreviewClient?.(client);
  };
  const handleRemoveClient = async (clientId: string) => {
    setIsRemovingClient(true);
    try {
      await removeClientFromCircularization(Number(communicationId), clientId);
      message.success("Cliente eliminado del envío");
      onClientRemoved?.();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al eliminar cliente");
    } finally {
      setIsRemovingClient(false);
    }
  };
  const handleViewEmail = (client: IPreviewClient) => setEmailModalClientId(client.client_id);

  const columns: ColumnsType<IPreviewClient> = [
    {
      title: "Nombre",
      dataIndex: "client_name",
      key: "client_name",
      width: "35%",
      render: (client_name: string, record) => (
        <button
          type="button"
          onClick={() => handlePreviewClient(record)}
          className="text-sm font-medium text-[#2563EB] hover:underline text-left"
        >
          {client_name}
        </button>
      )
    },
    {
      title: "Contactos",
      key: "contacts",
      align: "center",
      render: (_, record) => (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#141414] hover:text-[#2563EB] transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-gray-400" />
          {record.total_contacts}
        </button>
      )
    },
    {
      title: "Cartera",
      dataIndex: "total_portfolio",
      key: "total_portfolio",
      align: "right",
      render: (total_portfolio: number) => (
        <span className="text-sm text-[#141414]">${total_portfolio.toLocaleString("es-CO")}</span>
      )
    },
    {
      title: "Vencida",
      dataIndex: "past_due_amount",
      key: "past_due_amount",
      align: "right",
      render: (past_due_amount: number) => (
        <span className={`text-sm ${past_due_amount > 0 ? "text-[#141414]" : "text-[#AAAAAA]"}`}>
          {past_due_amount > 0 ? `$${past_due_amount.toLocaleString("es-CO")}` : "$0"}
        </span>
      )
    },
    {
      title: "Acuerdos de pago",
      dataIndex: "active_payment_agreements",
      key: "active_payment_agreements",
      align: "right",
      render: (active_payment_agreements: number) => (
        <span
          className={`text-sm ${active_payment_agreements > 0 ? "text-[#141414]" : "text-[#AAAAAA]"}`}
        >
          {active_payment_agreements > 0
            ? `$${active_payment_agreements.toLocaleString("es-CO")}`
            : "$0"}
        </span>
      )
    },
    {
      title: "",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "remove",
            disabled: isRemovingClient,
            label: (
              <span className="flex items-center gap-2 text-red-600 text-xs">
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar del envio
              </span>
            ),
            onClick: () => handleRemoveClient(record.client_id)
          }
        ];

        return (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => handleViewEmail(record)}
              className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-[#141414] hover:bg-gray-100 transition-all"
              title={`Ver correo de ${record.client_name}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <button
                type="button"
                className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-[#141414] hover:bg-gray-100 transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </Dropdown>
          </div>
        );
      }
    }
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={clients}
        rowKey="client_id"
        pagination={false}
        size="middle"
        loading={loading}
        rowClassName="border-b border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors"
      />

      {/* Confirm + Send */}
      <div className="mt-8 pt-6 border-t border-[#EEEEEE] flex items-center justify-between">
        <label className="flex items-start gap-3 cursor-pointer max-w-2xl">
          <Checkbox
            checked={confirmChecked}
            onCheckedChange={(v) => setConfirmChecked(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            Confirmo que he revisado el contenido y los destinatarios. Esta accion no se puede
            deshacer.
          </span>
        </label>
        <Button
          onClick={handleSend}
          disabled={!confirmChecked || sendSuccess}
          className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] font-semibold h-10 px-6"
        >
          {sendSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Comunicacion enviada
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar comunicacion
            </>
          )}
        </Button>
      </div>

      {emailModalClientId && (
        <ModalDetailClientCommunication
          open={!!emailModalClientId}
          onClose={() => setEmailModalClientId(null)}
          communicationId={communicationId}
          clientId={emailModalClientId}
        />
      )}
    </>
  );
}
