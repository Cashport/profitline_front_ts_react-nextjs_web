"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import Header from "@/components/organisms/header";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { useDebounce } from "@/hooks/useDeabouce";
import ClientPreview from "../../components/ClientPreview/ClientPreview";
import ModalAddClient from "../../components/ModalAddClient/ModalAddClient";
import TableMassCommunications from "../../components/TableMassCommunications/TableMassCommunications";
import { useClientCommunication } from "../../hooks/useClientCommunication";
import type { IPreviewClient } from "@/types/communications/ICommunications";

export default function MassComunicationsTableView() {
  const { communicationId } = useParams<{ communicationId: string }>();
  const isEmail = /^\d+$/.test(communicationId);

  const [selectedClient, setSelectedClient] = useState<IPreviewClient | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, mutate } = useClientCommunication({
    communicationId,
    page,
    search: debouncedSearch
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="cp-page">
      <Header title="Envío masivo de comunicación" back="/mass-communications" />
      <div className="cp-card px-[18px] py-[14px]">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <UiSearchInput placeholder="Buscar cliente..." onChange={handleSearch} />
          </div>
          <Button
            size="sm"
            className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] font-semibold gap-1.5 px-5 h-[var(--control-h)]"
            onClick={() => setIsAddClientOpen(true)}
          >
            <UserPlus className="size-[18px]" />
            +Añadir cliente
          </Button>
        </div>

        {/* Main content */}
        {selectedClient ? (
          <ClientPreview
            communicationId={communicationId}
            clientId={selectedClient.client_id}
            clientName={selectedClient.client_name}
            onBack={() => setSelectedClient(null)}
          />
        ) : (
          <TableMassCommunications
            clients={data?.clients ?? []}
            onPreviewClient={(client) => setSelectedClient(client)}
            onClientRemoved={() => mutate()}
            loading={loading}
            page={page}
            total={data?.total ?? 0}
            pageSize={data?.limit ?? 10}
            onPageChange={setPage}
            isWhatsapp={!isEmail}
          />
        )}
      </div>

      <ModalAddClient
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        communicationId={communicationId}
        onSuccess={mutate}
      />
    </div>
  );
}
