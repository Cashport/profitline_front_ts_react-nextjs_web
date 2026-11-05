"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Select as AntSelect, message } from "antd";
import useSWR from "swr";

import Header from "@/components/organisms/header";
import UiSearchInput from "@/components/ui/search-input";
import { runBotNow } from "@/services/dataQuality/dataQuality";
import { IBotStatusItem } from "@/types/dataQuality/IDataQuality";
import { ICountries } from "@/types/countries/ICountries";
import { fetcher } from "@/utils/api/api";
import { useConfirmBotExecution } from "@/hooks/useConfirmBotExecution";

import { AutomationStatusCards } from "../../components/automation-status-cards";
import { BotsTable } from "../../components/bots-table";
import { BotHistoryDrawer } from "../../components/bot-history-drawer";
import { useBotsStatus } from "../../hooks/useBotsStatus";

import { BotStatusFilter } from "../../types/automations";

type CountryFilter = number | "all";

export default function AutomationsView() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState<CountryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<BotStatusFilter>("all");
  const [executingScheduleId, setExecutingScheduleId] = useState<number | null>(null);
  const [selectedBot, setSelectedBot] = useState<IBotStatusItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // País = única fuente de verdad de cards + tabla: backend filtra y devuelve
  // `summary` calculado sobre las mismas filas de `data`.
  const {
    data: bots = [],
    summary,
    isLoading,
    error,
    mutate
  } = useBotsStatus(countryFilter === "all" ? undefined : countryFilter);
  const { data: countriesResponse } = useSWR<ICountries>("/country", fetcher, {
    revalidateOnFocus: false
  });

  // id_client_data es el mismo identificador que ya usa Clientes para esta ruta
  // (ver CountriesClientsView: router.push(`/data-quality/client/${record.id}`)).
  const goToClient = (bot: IBotStatusItem) => {
    router.push(`/data-quality/client/${bot.id_client_data}`);
  };

  // Ejecuta únicamente el schedule de esta fila (nunca todos los bots). Deshabilita
  // solo ese botón mientras responde y refresca el status al terminar, sin asumir
  // manualmente que el bot quedó exitoso: la fuente de verdad es el próximo fetch.
  const handleRun = async (bot: IBotStatusItem) => {
    if (executingScheduleId != null) return;

    setExecutingScheduleId(bot.schedule_id);
    try {
      const result = await runBotNow(bot.schedule_id);
      if (result.accepted) {
        message.success("Se solicitó la ejecución del bot correctamente.");
      } else {
        message.error(result.schedulerMessage || "No se pudo iniciar la ejecución del bot.");
      }
    } catch (error: any) {
      message.error(error?.message || "No se pudo iniciar la ejecución del bot.");
    } finally {
      setExecutingScheduleId(null);
      await mutate();
    }
  };

  const handleViewHistory = (bot: IBotStatusItem) => {
    setSelectedBot(bot);
    setIsDrawerOpen(true);
  };

  const { requestExecution, confirmationModal } = useConfirmBotExecution(handleRun);

  // Búsqueda y filtro por estado solo afectan la tabla; el país ya viene aplicado en `bots`.
  const filteredBots = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return bots.filter((bot) => {
      const matchesSearch =
        bot.bot.toLowerCase().includes(term) || bot.cliente.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || bot.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bots, searchTerm, statusFilter]);

  const countryOptions = useMemo(
    () =>
      (countriesResponse?.data ?? []).map((country) => ({
        label: country.country_name,
        value: country.id
      })),
    [countriesResponse]
  );

  return (
    <div className="cp-page">
      <Header title="Salud de Automatizaciones" back="/data-quality/alerts" />

      <div className="cp-card px-[18px] py-[14px]">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <UiSearchInput
                placeholder="Buscar cliente o bot..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <AntSelect
              showSearch
              optionFilterProp="label"
              value={countryFilter}
              onChange={setCountryFilter}
              placeholder="Todos los países"
              className="w-48"
              style={{ minWidth: "12rem", height: "var(--control-h)" }}
              options={[{ label: "Todos los países", value: "all" }, ...countryOptions]}
            />
          </div>
        </div>

        <AutomationStatusCards
          summary={isLoading || error ? undefined : summary}
          statusFilter={statusFilter}
          onStatusClick={setStatusFilter}
        />

        <div className="pt-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "#141414" }}>
            Bots por cliente
          </h3>
          <BotsTable
            bots={filteredBots}
            totalBots={bots.length}
            loading={isLoading}
            emptyText={error ? "No se pudo cargar el estado de los bots" : "Sin bots disponibles"}
            executingScheduleId={executingScheduleId}
            onRun={requestExecution}
            onViewHistory={handleViewHistory}
            onClientClick={goToClient}
          />
        </div>
      </div>

      <BotHistoryDrawer
        bot={selectedBot}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        executingScheduleId={executingScheduleId}
        onRun={requestExecution}
        onClientClick={goToClient}
      />
      {confirmationModal}
    </div>
  );
}
