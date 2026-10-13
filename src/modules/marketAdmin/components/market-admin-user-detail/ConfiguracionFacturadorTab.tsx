"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "antd";
import { IMarketAdminFacturador } from "@/types/marketAdmin/IMarketAdmin";

// Valor centinela para representar "Sin Facturador" en el selector.
const NO_BILLER = 0;

type Props = {
  currentBillerId: number | null;
  facturadores: IMarketAdminFacturador[];
  isLoading?: boolean;
  isSaving?: boolean;
  onSave: (billerUserId: number | null) => Promise<void>;
};

export default function ConfiguracionFacturadorTab({
  currentBillerId,
  facturadores,
  isLoading,
  isSaving,
  onSave
}: Props) {
  const [value, setValue] = useState<number>(currentBillerId ?? NO_BILLER);

  useEffect(() => {
    setValue(currentBillerId ?? NO_BILLER);
  }, [currentBillerId]);

  const options = useMemo(
    () => [
      { value: NO_BILLER, label: "Sin Facturador" },
      ...facturadores.map((facturador) => ({ value: facturador.id, label: facturador.name }))
    ],
    [facturadores]
  );

  const isDirty = value !== (currentBillerId ?? NO_BILLER);

  const handleSave = async () => {
    if (!isDirty) return;
    await onSave(value === NO_BILLER ? null : value);
  };

  return (
    <div className="max-w-lg">
      <p className="text-sm text-[#999999] mb-6">
        Facturador asignado al vendedor dentro del proyecto actual.
      </p>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-[#141414]">Facturador</label>
        <Select
          showSearch
          size="large"
          placeholder="Sin Facturador"
          className="w-full [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#DDDDDD] [&_.ant-select-selector]:!text-sm"
          popupClassName="[&_.ant-select-item]:!text-sm"
          value={value}
          options={options}
          loading={isLoading}
          disabled={isLoading || isSaving}
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
          }
          onChange={(selected: number) => setValue(selected)}
        />
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving || isLoading}
          className="text-sm font-semibold bg-[#141414] text-white px-5 py-2.5 rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
