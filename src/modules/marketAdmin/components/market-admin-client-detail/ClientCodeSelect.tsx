"use client";

import { useRouter } from "next/navigation";
import { Select } from "antd";
import useSWR from "swr";
import { useAppStore } from "@/lib/store/store";
import { getClientsByProject } from "@/services/banksPayments/banksPayments";
import { IMarketAdminClientCode } from "@/types/marketAdmin/IMarketAdmin";

// Selector de la esquina superior derecha del detalle del cliente: fija sobre
// qué cliente se está trabajando y, si el cliente tiene más de un registro en
// `client_marketplace`, sobre qué código (el `nit_id` externo, que cambia por
// unidad de negocio). Los sub-recursos del detalle —configuración, productos,
// direcciones, usuarios— se piden por ese código.
type Props = {
  nit: string;
  codigo?: string;
  codes: IMarketAdminClientCode[];
};

// Mismo estilo que los selects de ConfiguracionesTab.
const selectClass =
  "min-w-[240px] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#DDDDDD] [&_.ant-select-selector]:!text-sm";

export default function ClientCodeSelect({ nit, codigo, codes }: Props) {
  const router = useRouter();
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  // `getClientsByProject` → [{ "NOMBRE - NIT": NIT }] → { nit, label }[]
  const { data: clientsRes, isLoading } = useSWR(projectId ? ["ma-clients", projectId] : null, () =>
    getClientsByProject(projectId)
  );
  const clientOptions = (clientsRes ?? []).map((c) => {
    const label = Object.keys(c)[0] ?? "";
    return { value: String(c[label] ?? ""), label };
  });

  // Un solo código no necesita selector: es siempre el que está en uso.
  const showCodeSelect = codes.length > 1;
  const codeOptions = codes.map((c) => ({
    value: c.nit_id,
    label: c.bu ? `${c.bu} · ${c.nit_id}` : c.nit_id
  }));

  const goToClient = (nextNit: string) => {
    // Al cambiar de cliente se descarta el código: no pertenece al nuevo.
    router.push(`/market-admin/clientes/${nextNit}`);
  };

  const goToCode = (nextCode: string) => {
    router.replace(`/market-admin/clientes/${nit}?codigo=${encodeURIComponent(nextCode)}`, {
      scroll: false
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        showSearch
        size="large"
        className={selectClass}
        loading={isLoading}
        value={nit}
        options={clientOptions}
        notFoundContent="Sin clientes disponibles"
        onChange={goToClient}
        // Los options traen "NOMBRE - NIT": filtrar por cualquiera de las dos.
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        placeholder="Buscar cliente"
      />

      {showCodeSelect && (
        <Select
          size="large"
          className="min-w-[200px] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#DDDDDD] [&_.ant-select-selector]:!text-sm"
          value={codigo}
          options={codeOptions}
          onChange={goToCode}
          placeholder="Código"
        />
      )}
    </div>
  );
}
