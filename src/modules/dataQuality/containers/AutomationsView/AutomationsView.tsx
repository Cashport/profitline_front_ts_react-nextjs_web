"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Select as AntSelect } from "antd";

import { useMessageApi } from "@/context/MessageContext";
import { formatLocalDateTimeParts } from "@/utils/utils";

import Header from "@/components/organisms/header";
import { Card, CardContent } from "@/modules/chat/ui/card";
import UiSearchInput from "@/components/ui/search-input";
import { Button } from "@/modules/chat/ui/button";

import { AutomationStatusCards } from "../../components/automation-status-cards";
import { BotsTable, MOCKED_BOTS } from "../../components/bots-table";
import { BotHistoryDrawer } from "../../components/bot-history-drawer";

import { BOT_FILE_TYPE_META } from "../../constants";
import { BotStatusFilter, IBotHealth, IBotRun } from "../../types/automations";

const MOCKED_RUN_DURATION_MS = 2500;

export default function AutomationsView() {
  const router = useRouter();
  const { showMessage } = useMessageApi();

  const [bots, setBots] = useState<IBotHealth[]>(MOCKED_BOTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<BotStatusFilter>("all");
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Las corridas simuladas se cancelan al desmontar para no tocar estado muerto.
  const runTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => runTimeoutsRef.current.forEach(clearTimeout), []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/data-quality/alerts");
    }
  };

  const filteredBots = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return bots.filter((bot) => {
      const matchesSearch =
        bot.name.toLowerCase().includes(term) || bot.client.toLowerCase().includes(term);
      const matchesCountry = countryFilter === "all" || bot.country === countryFilter;
      const matchesStatus = statusFilter === "all" || bot.status === statusFilter;
      return matchesSearch && matchesCountry && matchesStatus;
    });
  }, [bots, searchTerm, countryFilter, statusFilter]);

  const uniqueCountries = useMemo(() => [...new Set(bots.map((bot) => bot.country))], [bots]);

  const summary = useMemo(
    () => ({
      total: bots.length,
      success: bots.filter((bot) => bot.status === "success").length,
      error: bots.filter((bot) => bot.status === "error").length,
      running: bots.filter((bot) => bot.status === "running").length
    }),
    [bots]
  );

  const handleViewHistory = useCallback((bot: IBotHealth) => {
    setSelectedBotId(bot.id);
    setIsDrawerOpen(true);
  }, []);

  const handleRunNow = useCallback(
    (bot: IBotHealth) => {
      if (bot.status === "running") return;

      setBots((prev) => prev.map((b) => (b.id === bot.id ? { ...b, status: "running" } : b)));
      showMessage(
        "success",
        `Ejecución de "${bot.name}" iniciada · ${bot.client} · ${BOT_FILE_TYPE_META[bot.fileType].label}`
      );

      // Simula la corrida a demanda y refleja el resultado en la tabla al terminar.
      const timeoutId = setTimeout(() => {
        const { date, time } = formatLocalDateTimeParts(new Date().toISOString());

        setBots((prev) =>
          prev.map((b) => {
            if (b.id !== bot.id) return b;
            const newRun: IBotRun = { date, time, status: "success", duration: "0m 52s" };
            return {
              ...b,
              status: "success",
              errorMessage: undefined,
              lastRun: { date, time },
              last60Days: {
                ...b.last60Days,
                total: b.last60Days.total + 1,
                success: b.last60Days.success + 1
              },
              history: [newRun, ...b.history]
            };
          })
        );
        showMessage("success", `"${bot.name}" terminó de ejecutarse correctamente`);
      }, MOCKED_RUN_DURATION_MS);

      runTimeoutsRef.current.push(timeoutId);
    },
    [showMessage]
  );

  // El bot vivo, no la copia del click: así el drawer refleja una corrida lanzada mientras está abierto.
  const selectedBot = bots.find((bot) => bot.id === selectedBotId) ?? null;

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
                  placeholder="Buscar bot o cliente..."
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
              onViewHistory={handleViewHistory}
              onRunNow={handleRunNow}
            />
          </div>
        </CardContent>
      </Card>

      <BotHistoryDrawer
        bot={selectedBot}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
