"use client";
import React, { useState } from "react";
import { Table, Flex } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, ArrowsClockwise } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "use-intl";

import UiSearchInput from "@/components/ui/search-input";
import IconButton from "@/components/atoms/IconButton/IconButton";
import { useMessageApi } from "@/context/MessageContext";
import { useDebounce } from "@/hooks/useDeabouce";
import { useBotsHealth } from "@/hooks/useBotsHealth";
import { useConfirmBotExecution } from "@/hooks/useConfirmBotExecution";
import { executeBotManually } from "@/services/bots/bots";
import { IBotHealth } from "@/types/bots/IBotHealth";

import { BotStatusBadge } from "../BotStatusBadge/BotStatusBadge";
import { BotSummaryCards } from "../BotSummaryCards/BotSummaryCards";
import { BotDetailDrawer } from "../BotDetailDrawer/BotDetailDrawer";

const PAGE_SIZE = 10;

// Sigue el mismo patrón de ThirdPartiesView (src/components/organisms/proveedores/ThirdPartiesView):
// Container + búsqueda con debounce + Table de antd. GET /data/bots/status devuelve el
// listado completo (sin paginación server-side); paginación/búsqueda/resumen se calculan
// en cliente dentro de useBotsHealth.
export const BotHealthView: React.FC = () => {
  const t = useTranslations("botHealth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { showMessage } = useMessageApi();
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBot, setSelectedBot] = useState<IBotHealth | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [executingId, setExecutingId] = useState<number | null>(null);

  const { data, summary, total, isLoading, mutate } = useBotsHealth({
    page: currentPage,
    pageSize: PAGE_SIZE,
    searchQuery: debouncedSearch
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setCurrentPage(1);
  };

  const openDrawer = (bot: IBotHealth) => {
    setSelectedBot(bot);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  // Navega a la ficha de datos del cliente en el módulo de Calidad de Datos,
  // donde se gestionan las ingestas/archivos de ese tipo de archivo específico.
  const goToClientDetail = (bot: IBotHealth) => {
    router.push(`/data-quality/client/${bot.id_client_data}`);
  };

  const handleQuickExecute = async (bot: IBotHealth) => {
    setExecutingId(bot.schedule_id);
    const success = await executeBotManually(bot.schedule_id, showMessage);
    setExecutingId(null);
    if (success) mutate();
  };

  const { requestExecution, confirmationModal } = useConfirmBotExecution(handleQuickExecute);

  const columns: ColumnsType<IBotHealth> = [
    {
      title: t("fields.bot"),
      dataIndex: "bot",
      key: "bot",
      sorter: (a, b) => a.bot.localeCompare(b.bot),
      showSorterTooltip: false
    },
    {
      title: t("fields.customer"),
      dataIndex: "cliente",
      key: "cliente",
      sorter: (a, b) => a.cliente.localeCompare(b.cliente),
      showSorterTooltip: false,
      render: (_, row) => (
        <button
          type="button"
          onClick={() => goToClientDetail(row)}
          style={{
            color: "#0085ff",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          {row.cliente}
        </button>
      )
    },
    {
      title: t("fields.country"),
      dataIndex: "pais",
      key: "pais",
      render: (pais) => pais || t("notAvailable")
    },
    {
      title: t("fields.fileType"),
      dataIndex: "tipo_archivo",
      key: "tipo_archivo",
      render: (tipo) => tipo || t("notAvailable")
    },
    {
      title: tCommon("fields.status"),
      dataIndex: "estado",
      key: "estado",
      render: (estado) => <BotStatusBadge estado={estado} />
    },
    {
      title: t("fields.lastRun"),
      dataIndex: "ultima_ejecucion",
      key: "ultima_ejecucion",
      render: (fecha) => fecha || t("notAvailable")
    },
    {
      title: tCommon("fields.actions"),
      key: "actions",
      render: (_, row) => (
        <Flex gap={4}>
          <IconButton
            style={{ backgroundColor: "#F7F7F7" }}
            icon={<ArrowsClockwise size={20} color="#141414" weight="bold" />}
            loading={executingId === row.schedule_id}
            onClick={() => requestExecution(row)}
            aria-label={t("actions.run")}
          />
          <IconButton
            style={{ backgroundColor: "#F7F7F7" }}
            icon={<Eye size={20} color="#141414" weight="bold" />}
            onClick={() => openDrawer(row)}
            aria-label={t("actions.viewDetail")}
          />
        </Flex>
      )
    }
  ];

  return (
    <div className="cp-page">
      <BotSummaryCards summary={summary} loading={isLoading} />

      <div className="cp-card flex flex-col gap-3 px-[18px] py-[14px]">
        <Flex gap={8}>
          <UiSearchInput placeholder={t("searchPlaceholder")} onChange={handleSearch} />
        </Flex>

        <Table
          columns={columns}
          dataSource={data.map((bot) => ({ ...bot, key: bot.schedule_id }))}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: PAGE_SIZE,
            total,
            onChange: setCurrentPage,
            showSizeChanger: false
          }}
        />
      </div>

      <BotDetailDrawer
        bot={selectedBot}
        visible={drawerVisible}
        onClose={closeDrawer}
        onExecuted={mutate}
      />
      {confirmationModal}
    </div>
  );
};
