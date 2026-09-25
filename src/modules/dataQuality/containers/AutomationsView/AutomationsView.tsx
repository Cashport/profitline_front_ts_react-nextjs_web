"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Select as AntSelect } from "antd";

import Header from "@/components/organisms/header";
import { Card, CardContent } from "@/modules/chat/ui/card";
import UiSearchInput from "@/components/ui/search-input";
import { Button } from "@/modules/chat/ui/button";

import { AutomationStatusCards } from "../../components/automation-status-cards";
import { BotsTable } from "../../components/bots-table";
import { useBotsStatus } from "../../hooks/useBotsStatus";

import { BotStatusFilter } from "../../types/automations";

export default function AutomationsView() {
  const router = useRouter();
  const { data: bots = [], isLoading } = useBotsStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<BotStatusFilter>("all");

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
        bot.bot.toLowerCase().includes(term) || bot.cliente.toLowerCase().includes(term);
      const matchesCountry = countryFilter === "all" || bot.pais === countryFilter;
      const matchesStatus = statusFilter === "all" || bot.estado === statusFilter;
      return matchesSearch && matchesCountry && matchesStatus;
    });
  }, [bots, searchTerm, countryFilter, statusFilter]);

  const uniqueCountries = useMemo(() => [...new Set(bots.map((bot) => bot.pais))], [bots]);

  const summary = useMemo(
    () => ({
      total: bots.length,
      EXITOSO: bots.filter((bot) => bot.estado === "EXITOSO").length,
      FALLIDO: bots.filter((bot) => bot.estado === "FALLIDO").length,
      EN_EJECUCION: bots.filter((bot) => bot.estado === "EN_EJECUCION").length
    }),
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
            <BotsTable bots={filteredBots} totalBots={bots.length} loading={isLoading} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
