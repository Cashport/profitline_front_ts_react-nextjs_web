"use client";

import { useCallback, useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { useSocket } from "@/context/ChatContext";
import { cn } from "@/utils/utils";

import { useSWRConfig } from "swr";
import config from "@/config";
import { type Conversation } from "@/modules/chat/lib/mock-data";

import AccountStatementModal from "../../components/account-statement-modal";
import AllChats from "../../components/all-chats";
import ChatDetails from "../chat-details";
import ChatThread from "../chat-thread";
import MassMessageSheet from "../../components/mass-message-sheet/mass-message-sheet";
import { auth } from "../../../../../firebase";
import useClientSegmentationDetail from "@/hooks/useClientSegmentationDetail";

export default function ChatInbox() {
  const { mutate } = useSWRConfig();

  const revalidateTickets = useCallback(() => {
    return mutate(
      (key) => typeof key === "string" && key.includes(`${config.API_CHAT}/whatsapp-tickets`)
    );
  }, [mutate]);

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [massOpen, setMassOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [showAccountStatementModal, setShowAccountStatementModal] = useState(false);

  const { connect } = useSocket();

  // Prefetch client segmentation detail as soon as a conversation is active
  useClientSegmentationDetail(
    activeConversation?.customerCashportUUID,
    activeConversation?.id || ""
  );

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
          onNewChat={() => setMassOpen(true)}
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

      <AccountStatementModal
        showModal={showAccountStatementModal}
        setShowModal={setShowAccountStatementModal}
        clientId={activeConversation?.customerCashportUUID}
        contactPhone={activeConversation?.phone}
      />
    </div>
  );
}
