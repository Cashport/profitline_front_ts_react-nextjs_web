"use client";

import { useEffect, useState } from "react";
import { Modal, Select } from "antd";
import { Button } from "@/modules/chat/ui/button";
import { WhatsappLogo } from "@phosphor-icons/react";
import { getWhatsappClients, getWhatsappClientContacts } from "@/services/chat/clients";
import { sendTemplate } from "@/services/chat/chat";
import { useToast } from "@/modules/chat/hooks/use-toast";

type Props = {
  open: boolean;
  templateId: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export default function SelectClientDialog({ open, templateId, onOpenChange, onSuccess }: Props) {
  const { toast } = useToast();
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [contacts, setContacts] = useState<
    { id: number; contact_name: string; contact_phone: string }[]
  >([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedContact, setSelectedContact] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    getWhatsappClients()
      .then((res) => setClients(res.map((c) => ({ id: c.uuid, name: c.client_name }))))
      .catch((err) => console.error("Error fetching WhatsApp clients:", err));
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedClient("");
      setSelectedContact("");
      setContacts([]);
    }
  }, [open]);

  useEffect(() => {
    setContacts([]);
    if (!selectedClient) return;
    (async () => {
      setLoadingContacts(true);
      try {
        const res = await getWhatsappClientContacts(selectedClient);
        setContacts(res);
      } catch (err) {
        console.error("Error fetching WhatsApp contacts:", err);
      } finally {
        setLoadingContacts(false);
      }
    })();
  }, [selectedClient]);

  const handleConfirm = async () => {
    const contact = contacts.find((c) => c.id.toString() === selectedContact);
    if (!contact) return;
    setIsSending(true);
    try {
      await sendTemplate({
        templateId,
        clientUuid: selectedClient,
        destinationNumber: [contact.contact_phone]
      });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast({
        title: "Error enviando",
        description: "No se pudo enviar el mensaje de WhatsApp.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
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
              onChange={(clientUUID: string) => setSelectedClient(clientUUID)}
              filterOption={(input, option) =>
                option?.label ? option.label.toLowerCase().includes(input.toLowerCase()) : false
              }
            />
          </div>

          <div className="space-y-2">
            <Select
              showSearch
              placeholder={loadingContacts ? "Cargando contactos..." : "Contacto"}
              style={{ width: "100%", height: "48px" }}
              disabled={loadingContacts || !selectedClient}
              loading={loadingContacts}
              options={contacts.map((c) => ({
                value: c.id.toString(),
                label: `${c.contact_name} (${c.contact_phone})`
              }))}
              value={selectedContact || undefined}
              onChange={(contactId: string) => setSelectedContact(contactId)}
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
            disabled={!selectedClient || !selectedContact || isSending}
          >
            {isSending ? "Enviando..." : "Enviar Whatsapp"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
