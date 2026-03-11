"use client";

import { useState } from "react";
import { Table, Tooltip, Dropdown } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { MenuProps } from "antd";
import { Eye, MoreHorizontal, Trash2, Users, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import {
  validatedClients,
  mockContacts,
  type IValidatedClient,
  type IContact
} from "../../lib/mockData";
import ModalDetailClientCommunication from "../ModalDetailClientCommunication/ModalDetailClientCommunication";

const channel = "email";

interface TableMassCommunicationsProps {
  onPreviewClient?: (client: IValidatedClient) => void;
}

export default function TableMassCommunications({ onPreviewClient }: TableMassCommunicationsProps) {
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [sendSuccess] = useState(false);
  const [emailModalClient, setEmailModalClient] = useState<IValidatedClient | null>(null);

  const handleSend = () => console.log("Send communication");
  const handlePreviewClient = (client: IValidatedClient) => {
    onPreviewClient?.(client);
  };
  const handleRemoveClient = (clientId: string) =>
    console.log("Remove client:", clientId);
  const handleViewEmail = (client: IValidatedClient) => setEmailModalClient(client);

  const columns: ColumnsType<IValidatedClient> = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      width: "35%",
      render: (name: string, record) => (
        <button
          type="button"
          onClick={() => handlePreviewClient(record)}
          className="text-sm font-medium text-[#2563EB] hover:underline text-left"
        >
          {name}
        </button>
      )
    },
    {
      title: "Contactos",
      key: "contacts",
      align: "center",
      render: (_, record) => {
        const contacts: IContact[] = mockContacts[record.id] ?? [
          {
            name: record.name,
            cargo: "Contacto principal",
            email: record.email,
            phone: record.phone
          }
        ];

        const tooltipContent = (
          <div className="w-64">
            <div className="bg-[#141414] px-4 py-2.5 -mx-2 -mt-1 mb-2 rounded-t">
              <p className="text-xs font-semibold text-white">{record.name}</p>
              <p className="text-[10px] text-gray-400">
                {contacts.length} contacto{contacts.length !== 1 ? "s" : ""} en la lista
              </p>
            </div>
            <div className="divide-y divide-[#F0F0F0]">
              {contacts.map((ct, i) => (
                <div key={i} className="py-2 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F0F0F0] flex items-center justify-center text-[11px] font-bold text-[#555] shrink-0 mt-0.5">
                    {ct.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#141414] truncate">{ct.name}</p>
                    <p className="text-[10px] text-gray-500">{ct.cargo}</p>
                    <p className="text-[10px] text-[#2563EB] truncate mt-0.5">
                      {channel === "email" ? ct.email : ct.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

        return (
          <Tooltip title={tooltipContent} placement="right" overlayInnerStyle={{ padding: "8px" }}>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#141414] hover:text-[#2563EB] transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {contacts.length}
            </button>
          </Tooltip>
        );
      }
    },
    {
      title: "Cartera",
      key: "cartera",
      align: "right",
      render: (_, record) => {
        const cartera = record.overdueTotal + 5000000;
        return <span className="text-sm text-[#141414]">${cartera.toLocaleString("es-CO")}</span>;
      }
    },
    {
      title: "Vencida",
      dataIndex: "overdueTotal",
      key: "vencida",
      align: "right",
      render: (overdueTotal: number) => (
        <span className={`text-sm ${overdueTotal > 0 ? "text-[#141414]" : "text-[#AAAAAA]"}`}>
          {overdueTotal > 0 ? `$${overdueTotal.toLocaleString("es-CO")}` : "$0"}
        </span>
      )
    },
    {
      title: "Acuerdos de pago",
      key: "acuerdos",
      align: "right",
      render: (_, record) => {
        const acuerdos = Math.round(record.overdueTotal * 0.3);
        return (
          <span className={`text-sm ${acuerdos > 0 ? "text-[#141414]" : "text-[#AAAAAA]"}`}>
            {acuerdos > 0 ? `$${acuerdos.toLocaleString("es-CO")}` : "$0"}
          </span>
        );
      }
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
            label: (
              <span className="flex items-center gap-2 text-red-600 text-xs">
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar del envio
              </span>
            ),
            onClick: () => handleRemoveClient(record.id)
          }
        ];

        return (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => handleViewEmail(record)}
              className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-[#141414] hover:bg-gray-100 transition-all"
              title={`Ver correo de ${record.name}`}
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
        dataSource={validatedClients}
        rowKey="id"
        pagination={false}
        size="middle"
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

      {emailModalClient && (
        <ModalDetailClientCommunication
          open={!!emailModalClient}
          onClose={() => setEmailModalClient(null)}
          clientInfo={emailModalClient}
        />
      )}
    </>
  );
}
