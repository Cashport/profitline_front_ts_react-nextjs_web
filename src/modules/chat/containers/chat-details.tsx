"use client";

import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Flex, message, Spin } from "antd";
import { CaretDoubleRight, Copy } from "@phosphor-icons/react";

import { deleteContact } from "@/services/contacts/contacts";
import { sendTemplate } from "@/services/chat/chat";

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
import AddClientModal from "../components/contacts-tab-modal";
import TemplateDialog from "../components/template-dialog/template-dialog";
import ModalGeneratePaymentLink from "../components/modalGeneratePaymentLink/ModalGeneratePaymentLink";
import ModalEnterProcess from "@/components/molecules/modals/ModalEnterProcess/ModalEnterProcess";

import { IAddClientForm } from "@/types/chat/IChat";

import type { Conversation } from "@/modules/chat/lib/mock-data";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

type Props = {
  conversation: Conversation;
  isOpen?: boolean;
  onClose?: () => void;
  onAccountStatement?: () => void;
  mutateTickets: () => void;
};

export default function ChatDetails({
  conversation,
  isOpen,
  onClose,
  onAccountStatement,
  mutateTickets
}: Props) {
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [templateTarget, setTemplateTarget] = useState<{
    clientUuid: string;
    destinationNumber: string;
  } | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);
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

  const shiptoCodes = clientDetails?.client.shipto_codes ?? [];

  const handleAddClientSuccess = (data: IAddClientForm) => {
    const clientUuid = String(data.client.value);
    const callingCode = data.indicative.label.split(" ")[0];
    const destinationNumber = callingCode + data.phone;
    setTemplateTarget({ clientUuid, destinationNumber });
  };

  const handleCloseModals = () => {
    setIsModalOpen({ isOpen: false, selected: 0 });
  };

  const handleOpenGeneratePaymentLink = () => {
    setIsModalOpen({ isOpen: true, selected: 1 });
  };

  const handleOpenDeactivateContact = () => {
    setIsModalOpen({ isOpen: true, selected: 2 });
  };

  const handleOpenCloseChat = () => {
    setIsModalOpen({ isOpen: true, selected: 3 });
  };

  const handleDeactivateContact = async () => {
    setIsActionLoading(true);
    try {
      const contactIdValue = clientDetails?.client.contact_id;
      if (!contactIdValue) return;
      const contactId = { contacts_ids: [contactIdValue] };
      const inactivate = true;
      await deleteContact(contactId, inactivate, clientDetails?.client.uuid || "", projectId);
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
                    key: "account-statement",
                    label: "Estado de cuenta",
                    onClick: onAccountStatement
                  },
                  {
                    key: "add-client",
                    label: "Agregar cliente",
                    onClick: () => setShowAddClientModal(true)
                  },
                  {
                    key: "generate-payment-link",
                    label: "Generar link de pago",
                    onClick: handleOpenGeneratePaymentLink
                  },
                  {
                    key: "deactivate-contact",
                    label: "Inactivar contacto",
                    onClick: handleOpenDeactivateContact
                  },
                  {
                    key: "close-chat",
                    label: "Cerrar chat",
                    onClick: handleOpenCloseChat
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
                    <div className="text-muted-foreground">NIT</div>
                    <div className="font-medium min-w-0 overflow-hidden flex items-center gap-1">
                      <span className="truncate">{clientDetails?.client.nit}</span>
                      {clientDetails?.client.nit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground"
                          aria-label="Copiar NIT"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(clientDetails.client.nit!);
                              toast({
                                title: "NIT copiado",
                                description: clientDetails.client.nit!
                              });
                            } catch {
                              toast({ title: "No se pudo copiar", variant: "destructive" });
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copiar NIT</span>
                        </Button>
                      ) : null}
                    </div>
                    <div className="text-muted-foreground">Teléfono</div>
                    <div className="font-medium min-w-0 overflow-hidden flex items-center gap-1">
                      <span className="truncate">{clientDetails?.client.phone}</span>
                      {clientDetails?.client.phone ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground"
                          aria-label="Copiar teléfono"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(clientDetails.client.phone);
                              toast({
                                title: "Teléfono copiado",
                                description: clientDetails.client.phone
                              });
                            } catch {
                              toast({ title: "No se pudo copiar", variant: "destructive" });
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copiar teléfono</span>
                        </Button>
                      ) : null}
                    </div>
                    {shiptoCodes.length > 0 ? (
                      <>
                        <div className="text-muted-foreground">Código(s)</div>
                        <div className="font-medium min-w-0 overflow-hidden flex items-center gap-1">
                          <span className="truncate">
                            {shiptoCodes[0]}
                            {shiptoCodes.length > 1 ? `, +${shiptoCodes.length - 1}` : ""}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-muted-foreground"
                            aria-label="Copiar código"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(shiptoCodes[0]);
                                toast({
                                  title: "Código copiado",
                                  description: shiptoCodes[0]
                                });
                              } catch {
                                toast({ title: "No se pudo copiar", variant: "destructive" });
                              }
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copiar código</span>
                          </Button>
                        </div>
                      </>
                    ) : null}
                    <div className="text-muted-foreground">Ejecutivo</div>
                    <div className="font-medium">
                      {clientDetails?.client.related_user?.user_name}
                    </div>
                    <div className="text-muted-foreground">Canal</div>
                    <div className="font-medium">{clientDetails?.client.channel?.join(", ")}</div>
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

        <ModalEnterProcess
          isOpen={isModalOpen.selected === 3}
          onClose={handleCloseModals}
          clientId={clientDetails?.client.uuid || ""}
          initialValues={{
            contactId: clientDetails?.client.contact_id ?? undefined,
            managementTypeId: 4, // Gestión de cierre de chat
          }}
          lockSelects
          extraFields={{
            ticketId: conversation.id,
            close_ticket: true
          }}
          onSuccess={() => {
            mutateTickets();
          }}
        />
      </div>

      <AddClientModal
        showAddClientModal={showAddClientModal}
        setShowAddClientModal={setShowAddClientModal}
        isActionLoading={false}
        initialName={conversation.customer}
        initialPhone={conversation.phone}
        onSuccess={handleAddClientSuccess}
      />

      <TemplateDialog
        open={templateTarget !== null}
        onOpenChange={(open) => {
          if (!open) setTemplateTarget(null);
        }}
        channel="whatsapp"
        loading={templateLoading}
        onUse={async (payload) => {
          if (!templateTarget) return;
          setTemplateLoading(true);
          try {
            await sendTemplate({
              templateId: payload.templateId,
              clientUuid: templateTarget.clientUuid,
              destinationNumber: [templateTarget.destinationNumber]
            });
            setTemplateTarget(null);
            toast({ title: "Plantilla enviada exitosamente" });
          } catch {
            toast({ title: "Error al enviar la plantilla", variant: "destructive" });
          } finally {
            setTemplateLoading(false);
          }
        }}
      />
    </aside>
  );
}
