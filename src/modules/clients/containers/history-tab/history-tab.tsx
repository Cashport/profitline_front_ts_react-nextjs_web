"use client";

import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Dropdown, Pagination, Spin } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { DotsThreeVertical, Eye, FileText, FileXls } from "@phosphor-icons/react";
import {
  Activity,
  FileCheck2,
  FileSignature,
  Handshake,
  Inbox,
  Mail,
  Receipt,
  Users,
  type LucideIcon
} from "lucide-react";

import { cn, extractSingleParam } from "@/utils/utils";
import { useMessageApi } from "@/context/MessageContext";
import { useClientHistory } from "@/hooks/useClientHistory";
import { useHistoryRowActions } from "../../hooks/history-tab/history-row-actions.hook";

import UiSearchInput from "@/components/ui/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { FilterModal } from "@/components/ui/filter-modal";
import type { FilterCategoryConfig, FilterSelection } from "@/components/ui/filter-modal";
import ModalActionsHistoryTab from "../../components/history-tab/history-tab-modal-generate-action";
import ModalCommunicationDetail from "../../components/history-tab/history-tab-modal-communication-detail/History-tab-modal-communication-detail";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import { IHistoryRow } from "@/types/clientHistory/IClientHistory";

import "./history-tab.scss";

dayjs.extend(utc);

const PAGE_SIZE = 10;
const ALL_EVENTS = "todos";

interface EventMeta {
  /** Valor de `event` tal como lo devuelve /history/get-history. */
  event: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

/* Icono y color por evento. Se compara sin tildes ni mayúsculas (ver normalizeEvent),
   así "Gestion" y "Gestión" caen en la misma entrada. Lo no mapeado usa el gris. */
const EVENT_META: EventMeta[] = [
  { event: "Aplicación de pago", icon: Receipt, color: "#15803D", bg: "#EEFCE8" },
  { event: "Legalización de saldo", icon: FileCheck2, color: "#7C3AED", bg: "#F3EEFE" },
  { event: "Acuerdo de Pago", icon: Handshake, color: "#0F766E", bg: "#E6F6F4" },
  { event: "Gestion", icon: Users, color: "#B45309", bg: "#FEF6E7" },
  { event: "Comunicacion", icon: Mail, color: "#2563EB", bg: "#EAF1FE" },
  { event: "Acta digital", icon: FileSignature, color: "#BE185D", bg: "#FCE7F3" }
];

const DEFAULT_EVENT_META: EventMeta = {
  event: "",
  icon: Activity,
  color: "#4B5563",
  bg: "#F3F4F6"
};

const normalizeEvent = (label: string) =>
  (label || "").normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();

const getEventMeta = (label: string) => {
  const key = normalizeEvent(label);
  return EVENT_META.find((meta) => normalizeEvent(meta.event) === key) ?? DEFAULT_EVENT_META;
};

/** Mismo botón "Filtrar" que TaskManager y Balances. */
const TRIGGER_CLASS =
  "h-12 flex items-center gap-2 border border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent px-4 rounded-md";

/* Evento | Descripción | Usuario | acciones. Al reactivar Monto, volver a la rejilla
   de 5 columnas: grid-cols-[minmax(220px,1.4fr)_minmax(220px,2fr)_minmax(180px,1fr)_140px_32px] */
const ROW_GRID =
  "grid grid-cols-[minmax(220px,1.4fr)_minmax(220px,2fr)_minmax(180px,1fr)_32px] gap-4 px-4";

/* `created_at` llega en UTC y se muestra en hora de Colombia (UTC-5),
   como lo hacía la pestaña anterior. */
const toLocalDate = (createdAt: string) => dayjs.utc(createdAt).subtract(5, "hour");
const getDateKey = (createdAt: string) => toLocalDate(createdAt).format("YYYY-MM-DD");
const getTime = (createdAt: string) => toLocalDate(createdAt).format("HH:mm");

const getRelativeLabel = (dateKey: string) => {
  const today = toLocalDate(new Date().toISOString()).startOf("day");
  const diffDays = today.diff(dayjs.utc(dateKey), "day");
  if (diffDays <= 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return `${diffDays} días`;
};

const formatFullDate = (dateKey: string) => {
  const label = dayjs.utc(dateKey).toDate().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const getInitials = (name: string) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .filter((_, index, words) => index === 0 || index === words.length - 1)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const getDocRef = (row: IHistoryRow) =>
  row.id_payment_application ? `#${row.id_payment_application}` : undefined;

interface FilterPillProps {
  active: boolean;
  label: string;
  count: number;
  color?: string;
  onClick: () => void;
}

const FilterPill = ({ active, label, count, color, onClick }: FilterPillProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
      active
        ? "border-cashport-black bg-cashport-black text-white"
        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-cashport-black"
    )}
  >
    {color && (
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: active ? "#fff" : color }}
      />
    )}
    {label}
    <span className={active ? "text-white/70" : "text-gray-400"}>{count}</span>
  </button>
);

interface HistoryEventRowProps {
  row: IHistoryRow;
  onOpenDetail: (row: IHistoryRow) => void;
  onRegenerateExcel: (row: IHistoryRow) => Promise<void>;
  onRegeneratePDF: (row: IHistoryRow) => Promise<void>;
}

const HistoryEventRow = ({
  row,
  onOpenDetail,
  onRegenerateExcel,
  onRegeneratePDF
}: HistoryEventRowProps) => {
  const docRef = getDocRef(row);
  const { icon: Icon, color, bg } = getEventMeta(row.event);

  // Menú de acciones heredado de la tabla anterior del historial.
  const items = [
    ...(row.id_mongo_log
      ? [
          {
            key: "detail",
            label: (
              <Button
                icon={<Eye size={20} />}
                className="buttonNoBorder"
                onClick={() => onOpenDetail(row)}
              >
                Ver detalle
              </Button>
            )
          }
        ]
      : []),
    {
      key: "excel",
      label: (
        <Button
          icon={<FileXls size={20} />}
          className="buttonNoBorder"
          onClick={() => onRegenerateExcel(row)}
        >
          Descargar plano
        </Button>
      )
    },
    {
      key: "pdf",
      label: (
        <Button
          icon={<FileText size={20} />}
          className="buttonNoBorder"
          onClick={() => onRegeneratePDF(row)}
        >
          Ver pdf
        </Button>
      )
    }
  ];

  const customDropdown = (menu: ReactNode) => (
    <div className="dropdownApplicationTable">{menu}</div>
  );

  return (
    <div className={cn(ROW_GRID, "items-center py-3 transition-colors hover:bg-gray-50/60")}>
      {/* Evento */}
      <div className="flex min-w-0 items-start gap-2.5">
        <div
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: bg, color }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="whitespace-nowrap text-sm font-medium" style={{ color }}>
              {row.event}
            </span>
            {docRef && <span className="whitespace-nowrap text-xs text-gray-400">{docRef}</span>}
          </div>
          <span className="text-xs text-gray-400">{getTime(row.created_at)}</span>
        </div>
      </div>

      {/* Descripción */}
      <p className="min-w-0 truncate text-sm text-gray-500" title={row.description}>
        {row.description}
      </p>

      {/* Usuario */}
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500">
          {getInitials(row.user_name)}
        </span>
        <span className="truncate text-sm text-gray-600">{row.user_name}</span>
      </div>

      {/* Monto: pendiente de que el API devuelva `amount`. Con dato:
          <span className="whitespace-nowrap text-sm font-semibold text-cashport-black">
            {formatCurrencyMoney(row.amount)}
          </span> */}
      {/* <div className="text-right">
        <span className="text-sm text-gray-300">—</span>
      </div> */}

      {/* Acciones */}
      <div className="flex justify-end">
        <Dropdown
          dropdownRender={customDropdown}
          menu={{ items }}
          placement="bottomLeft"
          trigger={["click"]}
        >
          <Button className="dotsBtn">
            <DotsThreeVertical size={16} />
          </Button>
        </Dropdown>
      </div>
    </div>
  );
};

const HistoryTab = () => {
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";
  const { showMessage } = useMessageApi();
  const { data, isLoading, error } = useClientHistory({ clientId });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeEvent, setActiveEvent] = useState(ALL_EVENTS);
  const [filters, setFilters] = useState<FilterSelection>({ evento: [], usuario: [] });
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState({ selected: 0 });
  const [rowDetailID, setRowDetailID] = useState<string>();

  const { handleOpenDetail, handleRegenerateExcel, handleRegeneratePDF } = useHistoryRowActions({
    onOpenCommunicationDetail: (mongoId) => {
      setRowDetailID(mongoId);
      setOpenModal({ selected: 3 });
    }
  });

  useEffect(() => {
    if (error) showMessage("error", "No se pudo cargar el historial del cliente");
  }, [error]);

  const rows = useMemo(() => data ?? [], [data]);

  // Un pill por cada `event` distinto, con su conteo sobre el total (sin filtrar).
  const eventCounts = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((row) => counts.set(row.event, (counts.get(row.event) ?? 0) + 1));
    return Array.from(counts.entries());
  }, [rows]);

  const userNames = useMemo(
    () => Array.from(new Set(rows.map((row) => row.user_name).filter(Boolean))),
    [rows]
  );

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const eventFilter = new Set((filters.evento ?? []).map((option) => option.id));
    const userFilter = new Set((filters.usuario ?? []).map((option) => option.id));

    return rows
      .filter((row) => {
        if (activeEvent !== ALL_EVENTS && row.event !== activeEvent) return false;
        if (eventFilter.size && !eventFilter.has(row.event)) return false;
        if (userFilter.size && !userFilter.has(row.user_name)) return false;
        if (!query) return true;
        return [row.description, row.event, row.user_name, getDocRef(row)].some((text) =>
          (text ?? "").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [rows, searchTerm, activeEvent, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  // Eventos de la página agrupados por día, en el orden en que aparecen.
  const groups = useMemo(() => {
    const map = new Map<string, IHistoryRow[]>();
    pageItems.forEach((row) => {
      const key = getDateKey(row.created_at);
      map.set(key, [...(map.get(key) ?? []), row]);
    });
    return Array.from(map.entries());
  }, [pageItems]);

  const filterCategories: FilterCategoryConfig[] = [
    {
      key: "evento",
      label: "Evento",
      options: eventCounts.map(([label]) => ({ id: label, name: label }))
    },
    {
      key: "usuario",
      label: "Usuario",
      options: userNames.map((name) => ({ id: name, name }))
    }
  ];

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleEventPillChange = (eventLabel: string) => {
    setActiveEvent(eventLabel);
    setPage(1);
  };

  const handleFiltersChange = (next: FilterSelection) => {
    setFilters(next);
    setPage(1);
  };

  const handleCloseModal = () => setOpenModal({ selected: 0 });

  // Pendiente: la tabla aún no selecciona filas, así que no hay aplicación que anular.
  const handleCancelApplication = () => {
    setOpenModal({ selected: 0 });
  };

  return (
    <div className="historyTab">
      <div className="flex flex-wrap items-center gap-2">
        <UiSearchInput
          className="standardSearch"
          placeholder="Buscar en el historial"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <GenerateActionButton onClick={() => setOpenModal({ selected: 1 })} />
        <FilterModal
          categories={filterCategories}
          value={filters}
          isLoading={isLoading}
          trigger={{ label: "Filtrar", showChevron: true, className: TRIGGER_CLASS }}
          formatTagValue={(_category, items) =>
            items.length === 1 ? items[0].name : `${items.length} seleccionados`
          }
          onApply={handleFiltersChange}
          onValueChange={handleFiltersChange}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <FilterPill
          active={activeEvent === ALL_EVENTS}
          label="Todos"
          count={rows.length}
          onClick={() => handleEventPillChange(ALL_EVENTS)}
        />
        {eventCounts.map(([label, count]) => (
          <FilterPill
            key={label}
            active={activeEvent === label}
            label={label}
            count={count}
            color={getEventMeta(label).color}
            onClick={() => handleEventPillChange(label)}
          />
        ))}
      </div>

      {isLoading ? (
        <div className="mt-5 flex h-12 items-center justify-center">
          <Spin />
        </div>
      ) : (
        <>
          <div className="mt-5 overflow-hidden rounded-lg border border-gray-100 bg-white">
            <div className={cn(ROW_GRID, "border-b border-gray-100 py-2.5")}>
              <span className="text-xs font-medium text-gray-400">Evento</span>
              <span className="text-xs font-medium text-gray-400">Descripción</span>
              <span className="text-xs font-medium text-gray-400">Usuario</span>
              {/* <span className="text-right text-xs font-medium text-gray-400">Monto</span> */}
              <span />
            </div>

            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Inbox className="mb-3 h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400">Sin resultados para esta búsqueda.</p>
              </div>
            ) : (
              groups.map(([dateKey, events], index) => (
                <div key={dateKey}>
                  <div className="flex items-baseline gap-1.5 bg-gray-50/60 px-4 pb-1.5 pt-3.5">
                    <span className="text-[13px] font-semibold text-cashport-black">
                      {getRelativeLabel(dateKey)}
                    </span>
                    <span className="text-[13px] text-gray-400">{formatFullDate(dateKey)}</span>
                  </div>

                  {events.map((row) => (
                    <HistoryEventRow
                      key={row.id}
                      row={row}
                      onOpenDetail={handleOpenDetail}
                      onRegenerateExcel={handleRegenerateExcel}
                      onRegeneratePDF={handleRegeneratePDF}
                    />
                  ))}

                  {index < groups.length - 1 && <div className="h-px bg-gray-100" />}
                </div>
              ))
            )}
          </div>

          {filtered.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-gray-400">
                Mostrando {pageItems.length} de {filtered.length} eventos
              </p>
              <Pagination
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={filtered.length}
                onChange={setPage}
                showSizeChanger={false}
                hideOnSinglePage
              />
            </div>
          )}
        </>
      )}

      <ModalActionsHistoryTab
        isOpen={openModal.selected === 1}
        onClose={handleCloseModal}
        setSelectOpen={setOpenModal}
      />

      <ModalConfirmAction
        isOpen={openModal.selected === 2}
        onClose={handleCloseModal}
        title="¿Estás seguro que deseas anular esta aplicación de pago?"
        content="Esta acción es definitiva"
        onOk={handleCancelApplication}
        okText="Anular aplicación"
      />

      <ModalCommunicationDetail
        isOpen={openModal.selected === 3}
        onClose={handleCloseModal}
        mongoID={rowDetailID}
      />
    </div>
  );
};

export default HistoryTab;
