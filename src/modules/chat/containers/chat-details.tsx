"use client";

import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Flex, message, Spin } from "antd";
import { CaretDoubleRight, Copy } from "@phosphor-icons/react";

import { deleteContact } from "@/services/contacts/contacts";

import useClientSegmentationDetail from "@/hooks/useClientSegmentationDetail";
import { cn } from "@/utils/utils";
import { useAppStore } from "@/lib/store/store";

import { Button } from "@/modules/chat/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/modules/chat/ui/accordion";
import { useToast } from "@/modules/chat/hooks/use-toast";
import ChatActions from "@/modules/chat/components/chat-actions";
import ModalGeneratePaymentLink from "../components/modalGeneratePaymentLink/ModalGeneratePaymentLink";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import type { Conversation } from "@/modules/chat/lib/mock-data";

type Props = {
  conversation: Conversation;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenAddClientModal?: () => void;
  mutateTickets: () => void;
};

export default function ChatDetails({
  conversation,
  isOpen,
  onClose,
  onOpenAddClientModal,
  mutateTickets
}: Props) {
  const { toast } = useToast();
  const { data: clientDetails, isLoading: loading } = useClientSegmentationDetail(
    conversation.customerCashportUUID,
    conversation.id
  );
  const [isModalOpen, setIsModalOpen] = useState({
    isOpen: false,
    selected: 0
  });
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);
  const formatMoney = useAppStore((state) => state.formatMoney);

  const handleCloseModals = () => {
    setIsModalOpen({ isOpen: false, selected: 0 });
  };

  const handleOpenGeneratePaymentLink = () => {
    setIsModalOpen({ isOpen: true, selected: 1 });
  };

  const handleOpenDeactivateContact = () => {
    setIsModalOpen({ isOpen: true, selected: 2 });
  };

  const handleDeactivateContact = async () => {
    setIsActionLoading(true);
    try {
      const contactIdValue = clientDetails?.client.contact_id;
      if (!contactIdValue) return;
      const contactId = { contacts_ids: [contactIdValue] };
      await deleteContact(contactId, clientDetails?.client.uuid || "", projectId);
      message.success("Contacto inactivado exitosamente");
      handleCloseModals();
      mutateTickets();
    } catch (error) {
      message.error("Error al inactivar el contacto");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <aside
      className={cn(
        "hidden border-l md:col-span-3 md:block min-h-0 flex flex-col",
        isOpen ? "md:block" : "md:hidden"
      )}
      style={{ borderColor: "#DDDDDD" }}
    >
      <div className="h-full overflow-y-auto">
        {loading ? (
          <Flex align="center" justify="center" style={{ minHeight: "300px" }}>
            <Spin size="large" />
          </Flex>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={onClose} aria-label="Ocultar información del cliente">
                <CaretDoubleRight size={20} />
              </button>
              <ChatActions
                items={[
                  {
                    key: "add-client",
                    label: "Agregar cliente",
                    onClick: () => onOpenAddClientModal?.()
                  },
                  {
                    key: "register-payment-agreement",
                    label: "Registrar acuerdo de pago"
                  },
                  {
                    key: "generate-payment-link",
                    label: "Generar link de pago",
                    onClick: handleOpenGeneratePaymentLink
                  },
                  {
                    key: "apply-payment",
                    label: "Aplicar pago"
                  },
                  {
                    key: "edit-contact",
                    label: "Editar contacto"
                  },
                  {
                    key: "deactivate-contact",
                    label: "Inactivar contacto",
                    onClick: handleOpenDeactivateContact
                  }
                ]}
              />
            </div>
            <Accordion type="single" collapsible defaultValue="info-cliente">
              <AccordionItem value="info-cliente" className="border-[#DDDDDD]">
                <AccordionTrigger>Información del cliente</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-[auto_auto] gap-2 text-sm">
                    <div className="text-muted-foreground">Nombre</div>
                    <Link
                      href={`/clientes/detail/${clientDetails?.client.uuid}/project/${projectId}/dashboard`}
                      target="_blank"
                      className="font-medium underline"
                    >
                      <div className="font-medium">{clientDetails?.client.business_name}</div>
                    </Link>
                    <div className="text-muted-foreground">Teléfono</div>
                    <div className="font-medium">{clientDetails?.client.phone}</div>
                    <div className="text-muted-foreground">Correo</div>
                    <div className="font-medium min-w-0 overflow-hidden flex items-center gap-1">
                      <span className="truncate">{clientDetails?.client.email}</span>
                      {clientDetails?.client.email ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground"
                          aria-label="Copiar correo"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(clientDetails.client.email);
                              toast({
                                title: "Correo copiado",
                                description: clientDetails.client.email
                              });
                            } catch {
                              toast({ title: "No se pudo copiar", variant: "destructive" });
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copiar correo</span>
                        </Button>
                      ) : null}
                    </div>
                    <div className="text-muted-foreground">Segmento</div>
                    <div className="font-medium">{clientDetails?.client.segment}</div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible defaultValue="deuda" className="mt-4">
              <AccordionItem value="deuda" className="border-[#DDDDDD]">
                <AccordionTrigger>Resumen de cartera</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-[auto_auto] gap-2 text-sm">
                    <div className="text-muted-foreground">Cartera total</div>
                    <p className="font-medium text-right">
                      {formatMoney(clientDetails?.portfolio.total_portfolio || 0)}
                    </p>
                    <div className="text-muted-foreground">Cartera vencida</div>
                    <p className="font-medium text-right">
                      {formatMoney(clientDetails?.portfolio.past_due_amount || 0)}
                    </p>
                    <div className="text-muted-foreground">Pagos no aplicados</div>
                    <p className="font-medium text-right">
                      {formatMoney(clientDetails?.portfolio.unapplied_payments || 0)}
                    </p>
                    <div className="text-muted-foreground">Último pago</div>
                    <p className="font-medium text-right">
                      {clientDetails?.portfolio.last_payment_date
                        ? dayjs(clientDetails.portfolio.last_payment_date).format("DD/MM/YY")
                        : "-"}
                    </p>
                    <div className="text-muted-foreground">DSO</div>
                    <p className="font-medium text-right">{clientDetails?.portfolio.dso ?? "-"}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        <ModalGeneratePaymentLink
          isOpen={isModalOpen.selected === 1}
          onClose={handleCloseModals}
          ticketInfo={{
            clientId: clientDetails?.client.uuid || "",
            clientName: clientDetails?.client.business_name || "",
            ticketId: conversation.id,
            email: clientDetails?.client.email || "",
            phone: clientDetails?.client.phone || ""
          }}
        />

        <ModalConfirmAction
          isOpen={isModalOpen.selected === 2}
          onClose={() => handleCloseModals()}
          onOk={handleDeactivateContact}
          title="¿Está seguro de inactivar este contacto?"
          okText="Inactivar"
          okLoading={isActionLoading}
        />
      </div>
    </aside>
  );
}
