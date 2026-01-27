import { Badge } from "@/modules/chat/ui/badge";

interface ClientDetailInfoProps {
  clientConfig: {
    periodicity: string;
    fileTypes: string[];
  };
  clientInfo: {
    ingestaSource: string;
    ingestaVariables: Array<{ key: string; value: string }>;
    stakeholder: string;
    dailyDetails: { diasHabiles: boolean; festivos: boolean };
    weeklyDetails: { acumulado: boolean; porRango: boolean };
  };
}

export function ClientDetailInfo({ clientConfig, clientInfo }: ClientDetailInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
          Periodicidad
        </p>
        <Badge
          variant="secondary"
          className="text-sm font-medium"
          style={{ backgroundColor: "#CBE71E", color: "#141414" }}
        >
          {clientConfig.periodicity}
        </Badge>
      </div>
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
          Tipos de Archivo
        </p>
        <div className="flex flex-wrap gap-2">
          {clientConfig.fileTypes.map((fileType) => (
            <Badge
              key={fileType}
              variant="secondary"
              className="text-sm font-medium bg-gray-200 text-gray-800"
            >
              {fileType}
            </Badge>
          ))}
        </div>
      </div>

      {clientConfig.periodicity === "Daily" && (
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
            Detalle de Periodicidad
          </p>
          <div className="flex flex-wrap gap-2">
            {clientInfo.dailyDetails.diasHabiles && (
              <Badge variant="secondary" className="text-sm font-medium bg-gray-200 text-gray-800">
                Días hábiles
              </Badge>
            )}
            {clientInfo.dailyDetails.festivos && (
              <Badge variant="secondary" className="text-sm font-medium bg-gray-200 text-gray-800">
                Festivos
              </Badge>
            )}
          </div>
        </div>
      )}

      {clientConfig.periodicity === "Weekly" && (
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
            Detalle de Periodicidad
          </p>
          <div className="flex flex-wrap gap-2">
            {clientInfo.weeklyDetails.acumulado && (
              <Badge variant="secondary" className="text-sm font-medium bg-gray-200 text-gray-800">
                Acumulado
              </Badge>
            )}
            {clientInfo.weeklyDetails.porRango && (
              <Badge variant="secondary" className="text-sm font-medium bg-gray-200 text-gray-800">
                Por rango
              </Badge>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
          Fuente de Ingesta
        </p>
        <p className="text-sm" style={{ color: "#141414" }}>
          {clientInfo.ingestaSource}
        </p>
      </div>

      <div className="col-span-2">
        <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
          Variables de Configuración
        </p>
        <div className="flex flex-wrap gap-2">
          {clientInfo.ingestaVariables.map((variable, index) => (
            <div key={index} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
              <span className="text-xs font-mono font-semibold text-gray-700">{variable.key}:</span>
              <span className="text-xs text-gray-600">{variable.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
          Stakeholder
        </p>
        <p className="text-sm" style={{ color: "#141414" }}>
          {clientInfo.stakeholder}
        </p>
      </div>
    </div>
  );
}
