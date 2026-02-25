"use client";

import { useCallback, useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { useSocket } from "@/context/ChatContext";
import { cn } from "@/utils/utils";

import { useSWRConfig } from "swr";
import config from "@/config";
import { type Conversation } from "@/modules/chat/lib/mock-data";

import { useToast } from "@/modules/chat/hooks/use-toast";
import { getWhatsappClientContacts, getWhatsappClients } from "@/services/chat/clients";
import { sendTemplate } from "@/services/chat/chat";
import AccountStatementModal from "../../components/account-statement-modal";
import AllChats from "../../components/all-chats";
import AddClientModal from "../../components/contacts-tab-modal";
import ChatDetails from "../chat-details";
import ChatThread from "../chat-thread";
import MassMessageSheet from "../../components/mass-message-sheet/mass-message-sheet";
import SelectClientDialog from "../../components/select-client-dialog/select-client-dialog";
import TemplateDialog from "../../components/template-dialog/template-dialog";
import { auth } from "../../../../../firebase";
import useClientSegmentationDetail from "@/hooks/useClientSegmentationDetail";

type NewConversation = {
  stage: "selectClient" | "selectContact" | "confirm" | "completed";
  clientUUID: string;
  clientName: string;
  contactId: string;
  contactNumber: string;
  templateId: string;
};

export default function ChatInbox() {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();

  const revalidateTickets = useCallback(() => {
    return mutate(
      (key) => typeof key === "string" && key.includes(`${config.API_CHAT}/whatsapp-tickets`)
    );
  }, [mutate]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [massOpen, setMassOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [sendNewMessage, setSendNewMessage] = useState(false);
  const [sendConversation, setSendConversation] = useState<NewConversation | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAccountStatementModal, setShowAccountStatementModal] = useState(false);

  const [contacts, setContacts] = useState<
    { id: number; contact_name: string; contact_phone: string }[]
  >([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  const { connect } = useSocket();

  // Prefetch client segmentation detail as soon as a conversation is active
  useClientSegmentationDetail(
    activeConversation?.customerCashportUUID,
    activeConversation?.id || ""
  );

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await getWhatsappClients();
        const formatted = res.map((c) => ({ id: c.uuid, name: c.client_name }));
        setClients(formatted);
      } catch (error) {
        console.error("Error fetching WhatsApp clients:", error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    setContacts([]);
    if (sendConversation?.clientUUID) {
      const fetchContacts = async () => {
        setLoadingContacts(true);
        try {
          const res = await getWhatsappClientContacts(sendConversation.clientUUID);
          setContacts(res);
        } catch (error) {
          console.error("Error fetching WhatsApp contacts:", error);
        } finally {
          setLoadingContacts(false);
        }
      };
      fetchContacts();
    }
  }, [sendConversation?.clientUUID]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (activeConversation?.id && user?.uid) {
        connect({
          userId: user.uid
        });
      }
    });
    return () => unsubscribe();
  }, [activeConversation?.id, connect]);

  const handleConversationSelect = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-white text-[#141414] rounded-lg">
      <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-12">
        <AllChats
          activeConversation={activeConversation}
          onConversationSelect={handleConversationSelect}
          onNewChat={() => setSendNewMessage(true)}
          onAddClient={() => setShowAddClientModal(true)}
        />

        <section
          className={cn(detailsOpen ? "md:col-span-6" : "md:col-span-9", "min-h-0 flex flex-col")}
        >
          {activeConversation ? (
            <ChatThread
              key={activeConversation.id}
              conversation={activeConversation}
              onShowDetails={() => setDetailsOpen(true)}
              detailsOpen={detailsOpen}
              mutateTickets={revalidateTickets}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Selecciona un chat para ver la conversacion
            </div>
          )}
        </section>

        {activeConversation && (
          <ChatDetails
            isOpen={detailsOpen}
            conversation={activeConversation}
            onClose={() => setDetailsOpen(false)}
            onOpenAddClientModal={() => setShowAddClientModal(true)}
            onAccountStatement={() => setShowAccountStatementModal(true)}
            mutateTickets={revalidateTickets}
          />
        )}
      </div>

      <MassMessageSheet
        open={massOpen}
        onOpenChange={setMassOpen}
        selectedCount={0}
        onSend={(payload) => {
          console.log("Envio masivo simulado:", payload);
          setMassOpen(false);
        }}
      />
      <SelectClientDialog
        onConfirm={async () => {
          const contact = contacts.find(
            (c) => c.id.toString() === (sendConversation?.contactId || "")
          );
          if (!contact) return;

          const templateId = sendConversation?.templateId || "";

          setIsSending(true);
          try {
            await sendTemplate({
              templateId,
              clientUuid: sendConversation?.clientUUID || "",
              destinationNumber: [contact.contact_phone]
            });
            setSendConversation(null);
            await revalidateTickets();
          } catch (error) {
            toast({
              title: "Error enviando",
              description: "No se pudo enviar el mensaje de WhatsApp.",
              variant: "destructive"
            });
          } finally {
            setIsSending(false);
          }
        }}
        onOpenChange={() => setSendConversation(null)}
        open={!!sendConversation}
        clients={clients}
        onSelectClient={(clientUUID) => {
          const selectedClient = clients.find((c) => c.id === clientUUID);
          setSendConversation((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              stage: "confirm",
              clientUUID,
              clientName: selectedClient?.name || "",
              contactId: "",
              contactNumber: ""
            };
          });
        }}
        onSelectContact={(contactId: string) => {
          console.log(contactId);
          setSendConversation((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              contactId
            };
          });
        }}
        isContactLoading={loadingContacts}
        isLoading={isSending}
        contacts={contacts}
      />
      <TemplateDialog
        open={sendNewMessage}
        onOpenChange={setSendNewMessage}
        channel={"whatsapp"}
        ticketId={activeConversation ? activeConversation.id : ""}
        onUse={(payload) => {
          setSendNewMessage(false);
          setSendConversation({
            stage: "selectClient",
            clientUUID: "",
            clientName: "",
            contactId: "",
            contactNumber: "",
            templateId: payload.templateId
          });
        }}
      />
      <AddClientModal
        showAddClientModal={showAddClientModal}
        setShowAddClientModal={setShowAddClientModal}
        isActionLoading={false}
        initialName={activeConversation?.customer}
        initialPhone={activeConversation?.phone}
      />
      <AccountStatementModal
        showModal={showAccountStatementModal}
        setShowModal={setShowAccountStatementModal}
        clientId={activeConversation?.customerCashportUUID}
        contactPhone={activeConversation?.phone}
      />
    </div>
  );
}
