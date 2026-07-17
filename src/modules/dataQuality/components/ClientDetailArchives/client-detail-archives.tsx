import { useEffect, useMemo, useRef, useState } from "react";
import { Dropdown, Spin, message } from "antd";
import { ChevronDown, Filter } from "lucide-react";
import { Plus } from "phosphor-react";

import { useArchivesClientDataByType } from "../../hooks/useArchivesClientDataByType";

import Collapse from "@/components/ui/collapse";
import { Button } from "@/modules/chat/ui/button";
import { DateRangeFilter } from "@/components/atoms/DateRangeFilter/DateRangeFilter";
import { ClientDetailTable, ArchiveTypeCollapseLabel } from "../ClientDetailTable";
import ModalCreateNewFile from "../ModalCreateNewFile/ModalCreateNewFile";
import { ModalDataIntake } from "../modal-data-intake";
import { IModalMode } from "../modal-data-intake/modal-data-intake";
import { IClientDetailDataArchive } from "@/types/dataQuality/IDataQuality";

interface IClientDetailArchivesProps {
  clientId: string;
  clientName?: string | null;
  clientNIT?: string | null;
  idCountry?: number | null;
  intakes?: IClientDetailDataArchive[];
  onMutateDetail: () => void;
  onCountsChange?: (counts: { shown: number; total: number }) => void;
}

export function ClientDetailArchives({
  clientId,
  clientName,
  clientNIT,
  idCountry,
  intakes = [],
  onMutateDetail,
  onCountsChange
}: IClientDetailArchivesProps) {
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });
  const [showProcessed, setShowProcessed] = useState<number[]>([]);
  const [showFuture, setShowFuture] = useState<number[]>([]);
  const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false);
  const [intakeModal, setIntakeModal] = useState({
    isOpen: false,
    mode: "create" as IModalMode
  });
  const [selectedIntake, setSelectedIntake] = useState<IClientDetailDataArchive | null>(null);

  // Fetch archives grouped by type for the collapsible sections
  const {
    archivesByType,
    isValidating: isArchivesValidating,
    mutate: mutateArchives
  } = useArchivesClientDataByType(clientId, dateRange.start, dateRange.end, showProcessed, showFuture);

  // Aggregate per-type counts so the parent can render the "Mostrando X de Y" footer.
  // `shown` counts the rows actually returned/displayed (grows when "show processed" is
  // toggled), so the footer tracks what's on screen rather than a fixed pending count.
  const shownCount = useMemo(
    () => archivesByType?.reduce((sum, group) => sum + group.archives.length, 0) ?? 0,
    [archivesByType]
  );
  const totalCount = useMemo(
    () => archivesByType?.reduce((sum, group) => sum + group.total_archives, 0) ?? 0,
    [archivesByType]
  );
  useEffect(() => {
    onCountsChange?.({ shown: shownCount, total: totalCount });
  }, [shownCount, totalCount, onCountsChange]);

  const intakeByType = useMemo(() => {
    const map = new Map<number, IClientDetailDataArchive>();
    intakes.forEach((intake) => {
      if (!map.has(intake.id_type_archive)) map.set(intake.id_type_archive, intake);
    });
    return map;
  }, [intakes]);

  const notifiedUnmatchedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!archivesByType || intakes.length === 0) return;

    const groupTypeIds = new Set(archivesByType.map((group) => group.id_type_archive));
    const intakesWithoutGroup = intakes.filter(
      (intake) => !groupTypeIds.has(intake.id_type_archive)
    );
    const groupsWithoutIntake = archivesByType.filter(
      (group) => !intakeByType.has(group.id_type_archive)
    );

    const signature = [
      intakesWithoutGroup.map((intake) => intake.id_type_archive).join(","),
      groupsWithoutIntake.map((group) => group.id_type_archive).join(",")
    ].join("|");
    if (notifiedUnmatchedRef.current === signature) return;
    notifiedUnmatchedRef.current = signature;

    if (intakesWithoutGroup.length > 0) {
      message.error(
        `Ingestas sin tipo de archivo correspondiente: ${intakesWithoutGroup
          .map((intake) => intake.tipo_archivo || intake.data_type?.description)
          .join(", ")}`
      );
    }
    if (groupsWithoutIntake.length > 0) {
      message.error(
        `Tipos de archivo sin ingesta configurada: ${groupsWithoutIntake
          .map((group) => group.tipo_archivo)
          .join(", ")}`
      );
    }
  }, [archivesByType, intakes, intakeByType]);

  const handleOpenIntakeModal = (mode: IModalMode, intake?: IClientDetailDataArchive) => {
    setSelectedIntake(intake ?? null);
    setIntakeModal({ isOpen: true, mode });
  };

  const toggleShowProcessed = (idTypeArchive: number) => {
    setShowProcessed((prev) =>
      prev.includes(idTypeArchive)
        ? prev.filter((id) => id !== idTypeArchive)
        : [...prev, idTypeArchive]
    );
  };

  const toggleShowFuture = (idTypeArchive: number) => {
    setShowFuture((prev) =>
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
            onClick={() => handleOpenIntakeModal("create")}
            variant="ghost"
            className="bg-transparent"
            style={{ color: "#141414" }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Crear nueva ingesta
          </Button>
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
          items={archivesByType.map((group) => {
            const intake = intakeByType.get(group.id_type_archive);
            return {
              key: group.id_type_archive,
              label: (
                <ArchiveTypeCollapseLabel
                  group={group}
                  intake={intake}
                  active={showProcessed.includes(group.id_type_archive)}
                  onToggle={() => toggleShowProcessed(group.id_type_archive)}
                  futureActive={showFuture.includes(group.id_type_archive)}
                  onToggleFuture={() => toggleShowFuture(group.id_type_archive)}
                  onViewIntake={() => handleOpenIntakeModal("view", intake)}
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
            };
          })}
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

      <ModalDataIntake
        clientId={clientId}
        clientName={clientName || ""}
        idCountry={idCountry || 0}
        open={intakeModal.isOpen}
        mode={intakeModal.mode}
        intakeData={selectedIntake}
        onOpenChange={() => {
          setIntakeModal({ isOpen: false, mode: "create" });
          setSelectedIntake(null);
        }}
        onSuccess={() => {
          onMutateDetail();
          mutateArchives();
        }}
      />
    </>
  );
}
