import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { Users, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

// Mock data for countries and their alerts
const countries = [
  {
    id: "colombia",
    name: "Colombia",
    code: "CO",
    alerts: 12,
    clients: 45,
    lastUpdate: "2024-04-29",
    status: "active",
    ingestionProgress: 87
  },
  {
    id: "mexico",
    name: "México",
    code: "MX",
    alerts: 8,
    clients: 32,
    lastUpdate: "2024-04-28",
    status: "active",
    ingestionProgress: 92
  }
];

export default function HomePage() {
  const totalAlerts = countries.reduce((sum, country) => sum + country.alerts, 0);
  const totalClients = countries.reduce((sum, country) => sum + country.clients, 0);

  return (
    <div className="bg-[#F7F7F7]">
      <div className="flex items-center space-x-4 mb-6">
        <h2 className="text-xl font-semibold text-[#141414]">Países y Distribuidores</h2>
        <Badge variant="secondary" className="text-sm">
          {countries.length} países activos
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => (
          <div
            key={country.id}
            className="hover:shadow-md transition-shadow cursor-pointer bg-white border border-[#DDDDDD] rounded-lg p-6"
          >
            <div className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-[#141414]">
                    {country.code}
                  </div>
                  <h3 className="text-lg text-[#141414]">{country.name}</h3>
                </div>
                {country.alerts > 0 && (
                  <Badge
                    variant={country.alerts > 10 ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {country.alerts} alertas
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#141414]" />
                  <span className="text-[#141414]">Clientes</span>
                </div>
                <span className="font-medium text-[#141414]">{country.clients}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-[#141414]" />
                    <span className="text-[#141414]">Ingesta del mes</span>
                  </div>
                  <span className="font-medium text-[#141414]">{country.ingestionProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all bg-[#141414]"
                    style={{ width: `${country.ingestionProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#141414]" />
                  <span className="text-[#141414]">Última actualización</span>
                </div>
                <span className="font-medium text-[#141414]">{country.lastUpdate}</span>
              </div>

              <div className="pt-2">
                <Link href="blank" target="_blank">
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
