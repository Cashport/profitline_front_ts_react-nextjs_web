import { useEffect, useMemo, useRef, useState } from "react";
import { Dropdown, Spin, message } from "antd";
import { FilterButton } from "@/components/ui/page-header-controls/page-header-controls";

import { useArchivesClientDataByType } from "../../hooks/useArchivesClientDataByType";

import Collapse from "@/components/ui/collapse";
import { DateRangeFilter } from "@/components/atoms/DateRangeFilter/DateRangeFilter";
import { ClientDetailTable, ArchiveTypeCollapseLabel } from "../ClientDetailTable";
import ModalCreateNewFile from "../ModalCreateNewFile/ModalCreateNewFile";
import ModalReprocessDates from "../ModalReprocessDates/ModalReprocessDates";
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
  /** Action chosen from the page "Generar acción" modal. */
  requestedAction?: ClientArchiveAction | null;
  onActionHandled?: () => void;
}

export type ClientArchiveAction = "createIntake" | "createFile" | "reprocessDates";

export function ClientDetailArchives({
  clientId,
  clientName,
  clientNIT,
  idCountry,
  intakes = [],
  onMutateDetail,
  onCountsChange,
  requestedAction,
  onActionHandled
}: IClientDetailArchivesProps) {
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });
  const [showProcessed, setShowProcessed] = useState<number[]>([]);
  const [showFuture, setShowFuture] = useState<number[]>([]);
  const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false);
  const [isReprocessDatesModalOpen, setIsReprocessDatesModalOpen] = useState(false);
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
  } = useArchivesClientDataByType(
    clientId,
    dateRange.start,
    dateRange.end,
    showProcessed,
    showFuture
  );

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

  useEffect(() => {
    if (!requestedAction) return;
    if (requestedAction === "createIntake") handleOpenIntakeModal("create");
    if (requestedAction === "createFile") setIsCreateFileModalOpen(true);
    if (requestedAction === "reprocessDates") setIsReprocessDatesModalOpen(true);
    onActionHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedAction]);

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
        onDateRangeChange={(start: string, end: string) => setDateRange({ start, end })}
        onClear={() => setDateRange({ start: null, end: null })}
      />
    </div>
  );

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-[#141414]">Archivos</h2>
        <Dropdown dropdownRender={() => filterMenu} trigger={["click"]} placement="bottomRight">
          <span>
            <FilterButton
              label="Fechas"
              count={dateRange.start || dateRange.end ? 1 : 0}
              onClick={() => undefined}
            />
          </span>
        </Dropdown>
      </div>

      {!archivesByType ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        // The shared Collapse pulls its chevron left; this lines it up with the card titles.
        <div className="pl-2">
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
        </div>
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

      <ModalReprocessDates
        isOpen={isReprocessDatesModalOpen}
        onClose={() => setIsReprocessDatesModalOpen(false)}
        clientId={clientId}
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
