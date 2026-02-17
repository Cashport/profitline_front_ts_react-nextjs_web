import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Spin } from "antd";
import { BellSimpleRinging } from "phosphor-react";
import { Users, Calendar, TrendingUp } from "lucide-react";

import { getSummaryCountries } from "@/services/dataQuality/dataQuality";
import { useAppStore } from "@/lib/store/store";
import { formatDateBars } from "@/utils/utils";

import { Badge as BadgeUI } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import Header from "@/components/organisms/header";

import { ISummaryCountries } from "@/types/dataQuality/IDataQuality";

export default function DataQualityView() {
  const { ID } = useAppStore((projects) => projects.selectedProject);

  const [summaryData, setSummaryData] = useState<ISummaryCountries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const countries = summaryData?.countries || [];
  const totalAlerts = summaryData?.countries.reduce((sum, c) => sum + c.active_alerts, 0) || 0;
  const totalCountries = summaryData?.total_countries || 0;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getSummaryCountries(ID);
        setSummaryData(response);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError("No se pudieron cargar los países. Por favor, intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    if (ID) {
      fetchData();
    }
  }, [ID]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Header title="Data Quality" />
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Header title="Data Quality" />
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119]"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Header title="Data Quality" />
        <h2 className="text-xl font-semibold text-[#141414] mb-6">Países y Distribuidores</h2>
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No hay países configurados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Header title="Data Quality" />
      <div className="flex items-center justify-between ">
        <div className="flex items-center space-x-4 mb-6">
          <h2 className="text-xl font-semibold text-[#141414]">Países y Distribuidores</h2>
          <BadgeUI variant="secondary" className="text-sm">
            {totalCountries} países activos
          </BadgeUI>
        </div>

        <Link href="/data-quality/alerts">
          <Badge count={totalAlerts} color="#E53935">
            <Button variant="outline">
              <BellSimpleRinging size={18} />
              Alertas
            </Button>
          </Badge>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => (
          <div
            key={country.id_country}
            className="hover:shadow-md transition-shadow cursor-pointer bg-white rounded-lg p-6"
          >
            <div className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-[#141414]">
                    {country.country_name.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="text-lg text-[#141414]">{country.country_name}</h3>
                </div>
                {country.active_alerts > 0 && (
                  <BadgeUI
                    variant={country.active_alerts > 10 ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {country.active_alerts} alertas
                  </BadgeUI>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#141414]" />
                  <span className="text-[#141414]">Clientes</span>
                </div>
                <span className="font-medium text-[#141414]">{country.total_clients}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-[#141414]" />
                    <span className="text-[#141414]">Ingesta del mes</span>
                  </div>
                  <span className="font-medium text-[#141414]">
                    {country.monthly_ingestion_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all bg-[#141414]"
                    style={{ width: `${country.monthly_ingestion_percentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#141414]" />
                  <span className="text-[#141414]">Última actualización</span>
                </div>
                <span className="font-medium text-[#141414]">
                  {formatDateBars(country.last_update_date)}
                </span>
              </div>

              <div className="pt-2">
                <Link href={`/data-quality/country/${country.id_country}`}>
                  <Button className="w-full text-sm font-medium bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none">
                    Ver Clientes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
