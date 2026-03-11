"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import UiSearchInput from "@/components/ui/search-input/search-input";
import ClientPreview from "../../components/ClientPreview/ClientPreview";
import TableMassCommunications from "../../components/TableMassCommunications/TableMassCommunications";

export default function MassComunicationsTableView() {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Search:", e.target.value);
  };

  return (
    <div className="min-h-screen bg-[#EBEBEB] px-8 py-8">
      <h1 className="text-2xl font-bold text-[#141414] mb-4">Envio masivo de comunicacion</h1>
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
            onClick={() => console.log("Add client")}
          >
            <UserPlus className="w-3.5 h-3.5" />
            +Añadir cliente
          </Button>
        </div>

        {/* Main content */}
        {showPreview ? <ClientPreview /> : <TableMassCommunications />}
      </div>
    </div>
  );
}
