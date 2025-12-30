"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Button } from "@/modules/chat/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { WhatsappLogo } from "@phosphor-icons/react";

type Props = {
  open: boolean;
  clients: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
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

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          {/* Icon Header */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-[#CBE71E] flex items-center justify-center">
              <WhatsappLogo size={24} color="#141414" weight="fill" />
            </div>
            <DialogTitle className="text-xl font-semibold text-center">
              Seleccionar cliente
            </DialogTitle>
          </div>

          {/* Form Content */}
          <div className="w-full space-y-4 mt-4">
            <div className="space-y-2">
              <Select
                value={selectedClient}
                onValueChange={(clientUUID) => {
                  onSelectClient(clientUUID);
                  setSelectedClient(clientUUID);
                }}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 h-12">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select
                value={selectedContact}
                onValueChange={(contactId) => {
                  onSelectContact(contactId);
                  setSelectedContact(contactId);
                }}
                disabled={isContactLoading || !selectedClient}
              >
                {isContactLoading ? (
                  <SelectTrigger className="w-full bg-white border-gray-200 h-12">
                    <SelectValue placeholder="Cargando contactos..." />
                  </SelectTrigger>
                ) : (
                  <SelectTrigger className="w-full bg-white border-gray-200 h-12">
                    <SelectValue placeholder="Contacto" />
                  </SelectTrigger>
                )}

                <SelectContent className="max-h-[300px]">
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      </DialogContent>
    </Dialog>
  );
}
