import { useState } from "react";
import { Dropdown, Spin } from "antd";
import { ChevronDown, Filter } from "lucide-react";
import { Plus } from "phosphor-react";

import { useArchivesClientDataByType } from "../../hooks/useArchivesClientDataByType";

import Collapse from "@/components/ui/collapse";
import { Button } from "@/modules/chat/ui/button";
import { DateRangeFilter } from "@/components/atoms/DateRangeFilter/DateRangeFilter";
import { ClientDetailTable, ArchiveTypeCollapseLabel } from "../ClientDetailTable";
import ModalCreateNewFile from "../ModalCreateNewFile/ModalCreateNewFile";

interface IClientDetailArchivesProps {
  clientId: string;
  clientName?: string | null;
  clientNIT?: string | null;
  onMutateDetail: () => void;
}

export function ClientDetailArchives({
  clientId,
  clientName,
  clientNIT,
  onMutateDetail
}: IClientDetailArchivesProps) {
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });
  const [showProcessed, setShowProcessed] = useState<number[]>([]);
  const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false);

  // Fetch archives grouped by type for the collapsible sections
  const {
    archivesByType,
    isValidating: isArchivesValidating,
    mutate: mutateArchives
  } = useArchivesClientDataByType(clientId, dateRange.start, dateRange.end, showProcessed);

  const toggleShowProcessed = (idTypeArchive: number) => {
    setShowProcessed((prev) =>
      prev.includes(idTypeArchive)
        ? prev.filter((id) => id !== idTypeArchive)
        : [...prev, idTypeArchive]
    );
  };

  const filterMenu = (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg w-80 p-4">
      <DateRangeFilter
        dateRange={dateRange}
        onDateRangeChange={(start, end) => setDateRange({ start, end })}
        onClear={() => setDateRange({ start: null, end: null })}
      />
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-start gap-3">
          <h2 className="text-lg font-semibold" style={{ color: "#141414" }}>
            Archivos
          </h2>
          <Button
            onClick={() => setIsCreateFileModalOpen(true)}
            variant="ghost"
            className="bg-transparent"
            style={{ color: "#141414" }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Crear nuevo archivo
          </Button>
        </div>
        <Dropdown dropdownRender={() => filterMenu} trigger={["click"]} placement="bottomRight">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </Dropdown>
      </div>

      {!archivesByType ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        <Collapse
          items={archivesByType.map((group) => ({
            key: group.id_type_archive,
            label: (
              <ArchiveTypeCollapseLabel
                group={group}
                active={showProcessed.includes(group.id_type_archive)}
                onToggle={() => toggleShowProcessed(group.id_type_archive)}
              />
            ),
            children: (
              <ClientDetailTable
                archives={group.archives}
                clientName={clientName}
                mutateDetail={onMutateDetail}
                onMutate={() => mutateArchives()}
                loading={isArchivesValidating}
              />
            )
          }))}
        />
      )}

      <ModalCreateNewFile
        isOpen={isCreateFileModalOpen}
        onClose={() => setIsCreateFileModalOpen(false)}
        clientId={clientId}
        clientNIT={clientNIT}
        onSuccess={() => {
          onMutateDetail();
          mutateArchives();
        }}
      />
    </>
  );
}
