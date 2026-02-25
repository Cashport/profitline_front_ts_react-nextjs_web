"use client";

import { useEffect, useState } from "react";
import { Modal, Select } from "antd";
import { Button } from "@/modules/chat/ui/button";
import { WhatsappLogo } from "@phosphor-icons/react";

type Props = {
  open: boolean;
  clients: { id: string; name: string }[];
  contacts?: { id: number; contact_name: string; contact_phone: string }[];
  onSelectClient: (clientUUID: string) => void;
  onSelectContact: (contactId: string) => void;
  isContactLoading: boolean;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function SelectClientDialog({
  open,
  clients,
  contacts,
  isContactLoading,
  isLoading,
  onOpenChange,
  onConfirm,
  onSelectClient,
  onSelectContact
}: Props) {
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedContact, setSelectedContact] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedClient("");
      setSelectedContact("");
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={null}
      closable={false}
      width={500}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Icon Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-full bg-[#CBE71E] flex items-center justify-center">
            <WhatsappLogo size={24} color="#141414" weight="fill" />
          </div>
          <h3 className="text-xl font-semibold text-center">Seleccionar cliente</h3>
        </div>

        {/* Form Content */}
        <div className="w-full space-y-4 mt-4">
          <div className="space-y-2">
            <Select
              showSearch
              placeholder="Cliente"
              style={{ width: "100%", height: "48px" }}
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
              value={selectedClient || undefined}
              onChange={(clientUUID: string) => {
                onSelectClient(clientUUID);
                setSelectedClient(clientUUID);
              }}
              filterOption={(input, option) =>
                option?.label ? option.label.toLowerCase().includes(input.toLowerCase()) : false
              }
            />
          </div>

          <div className="space-y-2">
            <Select
              showSearch
              placeholder={isContactLoading ? "Cargando contactos..." : "Contacto"}
              style={{ width: "100%", height: "48px" }}
              disabled={isContactLoading || !selectedClient}
              loading={isContactLoading}
              options={contacts?.map((c) => ({
                value: c.id.toString(),
                label: `${c.contact_name} (${c.contact_phone})`
              }))}
              value={selectedContact || undefined}
              onChange={(contactId: string) => {
                onSelectContact(contactId);
                setSelectedContact(contactId);
              }}
              filterOption={(input, option) =>
                option?.label ? option.label.toLowerCase().includes(input.toLowerCase()) : false
              }
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex w-full gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 h-12 text-[#141414] font-medium hover:opacity-90"
            style={{ backgroundColor: "#CBE71E" }}
            onClick={handleConfirm}
            disabled={!selectedClient || !selectedContact || isLoading}
          >
            {isLoading ? "Enviando..." : "Enviar Whatsapp"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
