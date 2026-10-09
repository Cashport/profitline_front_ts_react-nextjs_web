import { useContext, useEffect, useState } from "react";
import { Modal } from "antd";

import WarehouseSelect from "@/modules/commerce/components/warehouse-select";
import CitiesSelect from "@/modules/commerce/components/cities-select";
import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";
import { useCityWarehouse } from "@/app/comercio/pedido/hooks/useCityWarehouses";

// New-address modal (Ant Design). Owns its own ciudad/dirección/bodega local state
// and reports the result through onSave; resets on save/cancel.
interface INewAddressModalProps {
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  onSave: (city: string, dispatchAddress: string, warehouseId: number) => void;
  onCancel: () => void;
}

function NewAddressModal({ open, onSave, onCancel }: INewAddressModalProps) {
  const [newCiudad, setNewCiudad] = useState("");
  const [newDireccion, setNewDireccion] = useState("");
  const [newWarehouseId, setNewWarehouseId] = useState<number | undefined>();
  const [warehouseForced, setWarehouseForced] = useState<number | undefined>();
  const { warehouseBu, isCityLoading, warehouseCities } = useCityWarehouse();
  const { businessUnit } = useContext(OrderViewContext);

  const reset = () => {
    setNewCiudad("");
    setNewDireccion("");
    setNewWarehouseId(undefined);
    setWarehouseForced(undefined);
  };

  // Cuando el canal (businessUnit) del contexto coincide con una entrada de
  // warehouseBu, preseleccionamos y forzamos la bodega correspondiente.
  // Si el canal no matchea, liberamos la bodega para que el usuario la elija
  // (o la autocomplete desde la ciudad seleccionada).
  useEffect(() => {
    const matchedWarehouseId = businessUnit
      ? (warehouseBu as Record<string, number | undefined>)[businessUnit]
      : undefined;
    if (matchedWarehouseId !== undefined) {
      setNewWarehouseId(matchedWarehouseId);
      setWarehouseForced(matchedWarehouseId);
    } else {
      setWarehouseForced(undefined);
    }
  }, [businessUnit]);

  const isSaveDisabled = !newCiudad.trim() || !newDireccion.trim() || newWarehouseId === undefined;

  // Cuando el usuario elige/crea una ciudad en el CitiesSelect, sincronizamos
  // la bodega siempre y cuando no haya una bodega forzada por businessUnit.
  const handleSelectCityWarehouse = (warehouseId: number) => {
    if (warehouseForced !== undefined) return;
    setNewWarehouseId(warehouseId);
  };

  const handleSave = () => {
    if (isSaveDisabled) return;
    onSave(newCiudad.trim(), newDireccion.trim(), newWarehouseId);
    reset();
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Modal
      title="Nueva dirección"
      open={open}
      okText="Guardar"
      cancelText="Cancelar"
      onOk={handleSave}
      okButtonProps={{ disabled: isSaveDisabled }}
      onCancel={handleCancel}
      destroyOnClose
    >
      <div className="flex flex-col gap-3 py-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#666666]">Ciudad</label>
          <CitiesSelect
            cities={warehouseCities}
            isLoading={isCityLoading}
            onChangeWarehouseId={handleSelectCityWarehouse}
            autoFocus
            value={newCiudad}
            onChange={setNewCiudad}
            placeholder="Bogotá"
            className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#666666]">Dirección de despacho</label>
          <input
            type="text"
            placeholder="Cl. 76 9-88"
            value={newDireccion}
            maxLength={35}
            onChange={(e) => setNewDireccion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999]"
          />
          <p className="text-[10px] text-[#999999]">Máximo 35 caracteres</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#666666]">Bodega de despacho</label>
          <WarehouseSelect
            warehouseForced={warehouseForced}
            value={newWarehouseId}
            onChange={setNewWarehouseId}
          />
        </div>
      </div>
    </Modal>
  );
}

export default NewAddressModal;
