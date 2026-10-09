"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Select as AntSelect, message } from "antd";

import Header from "@/components/organisms/header";
import { Card, CardContent } from "@/modules/chat/ui/card";
import UiSearchInput from "@/components/ui/search-input";
import { Button } from "@/modules/chat/ui/button";
import { runBotNow } from "@/services/dataQuality/dataQuality";
import { IBotStatusItem } from "@/types/dataQuality/IDataQuality";

import { AutomationStatusCards } from "../../components/automation-status-cards";
import { BotsTable } from "../../components/bots-table";
import { BotHistoryDrawer } from "../../components/bot-history-drawer";
import { useBotsStatus } from "../../hooks/useBotsStatus";

import { BotStatusFilter, IBotsSummary } from "../../types/automations";

export default function AutomationsView() {
  const router = useRouter();
  const { data: bots = [], isLoading, mutate } = useBotsStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<BotStatusFilter>("all");
  const [executingScheduleId, setExecutingScheduleId] = useState<number | null>(null);
  const [selectedBot, setSelectedBot] = useState<IBotStatusItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/data-quality/alerts");
    }
  };

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

  const filteredBots = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return bots.filter((bot) => {
      const matchesSearch =
        bot.bot.toLowerCase().includes(term) || bot.cliente.toLowerCase().includes(term);
      const matchesCountry = countryFilter === "all" || bot.pais === countryFilter;
      const matchesStatus = statusFilter === "all" || bot.estado === statusFilter;
      return matchesSearch && matchesCountry && matchesStatus;
    });
  }, [bots, searchTerm, countryFilter, statusFilter]);

  const uniqueCountries = useMemo(() => {
    const paises = bots.map((bot) => bot.pais).filter((pais): pais is string => Boolean(pais));
    return paises.filter((pais, index) => paises.indexOf(pais) === index);
  }, [bots]);

  const summary = useMemo<IBotsSummary>(
    () =>
      bots.reduce<IBotsSummary>(
        (acc, bot) => {
          acc.total += 1;
          // PENDIENTE/SIN_EJECUCIONES cuentan en el total pero no tienen card propia:
          // el total NO debe forzarse como la suma de las 4 cards.
          if (
            bot.estado === "EXITOSO" ||
            bot.estado === "FALLIDO" ||
            bot.estado === "EN_EJECUCION" ||
            bot.estado === "EN_REVISION"
          ) {
            acc[bot.estado] += 1;
          }
          return acc;
        },
        { total: 0, EXITOSO: 0, FALLIDO: 0, EN_EJECUCION: 0, EN_REVISION: 0 }
      ),
    [bots]
  );

  return (
    <div className="flex flex-col gap-4">
      <Header title="Salud de Automatizaciones" />

      <Card className="p-0 border-none">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-gray-900"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Atrás
              </Button>

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
                style={{ minWidth: "12rem", height: "48px" }}
                options={[
                  { label: "Todos los países", value: "all" },
                  ...uniqueCountries.map((country) => ({ label: country, value: country }))
                ]}
              />
            </div>
          </div>

          <AutomationStatusCards
            summary={summary}
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
              executingScheduleId={executingScheduleId}
              onRun={handleRun}
              onViewHistory={handleViewHistory}
              onClientClick={goToClient}
            />
          </div>
        </CardContent>
      </Card>

      <BotHistoryDrawer
        bot={selectedBot}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        executingScheduleId={executingScheduleId}
        onRun={handleRun}
        onClientClick={goToClient}
      />
    </div>
  );
}
