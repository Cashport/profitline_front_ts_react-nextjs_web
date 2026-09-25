"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { useDebounce } from "@/hooks/useDeabouce";
import ClientPreview from "../../components/ClientPreview/ClientPreview";
import ModalAddClient from "../../components/ModalAddClient/ModalAddClient";
import TableMassCommunications from "../../components/TableMassCommunications/TableMassCommunications";
import { useClientCommunication } from "../../hooks/useClientCommunication";
import type { IPreviewClient } from "@/types/communications/ICommunications";

export default function MassComunicationsTableView() {
  const router = useRouter();
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
    <div className="min-h-screen">
      <h1 className="text-2xl font-semibold text-[#141414] mb-4">Envio masivo de comunicacion</h1>
      <div className="bg-white rounded-xl px-8 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                router.push("/mass-communications");
              }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#141414] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Inicio
            </button>
            <UiSearchInput placeholder="Buscar cliente..." onChange={handleSearch} />
          </div>
          <Button
            size="sm"
            className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] font-semibold gap-1.5 px-5 h-9"
            onClick={() => setIsAddClientOpen(true)}
          >
            <UserPlus className="w-3.5 h-3.5" />
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
