import { useState } from "react";
import { Modal } from "antd";

// New-address modal (Ant Design). Owns its own ciudad/dirección local state and
// reports the result through onSave; resets on save/cancel.
interface INewAddressModalProps {
  open: boolean;
  onSave: (city: string, dispatchAddress: string) => void;
  onCancel: () => void;
}

function NewAddressModal({ open, onSave, onCancel }: INewAddressModalProps) {
  const [newCiudad, setNewCiudad] = useState("");
  const [newDireccion, setNewDireccion] = useState("");

  const reset = () => {
    setNewCiudad("");
    setNewDireccion("");
  };

  const handleSave = () => {
    if (!newCiudad.trim() || !newDireccion.trim()) return;
    onSave(newCiudad.trim(), newDireccion.trim());
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
      okButtonProps={{ disabled: !newCiudad.trim() || !newDireccion.trim() }}
      onCancel={handleCancel}
      destroyOnClose
    >
      <div className="flex flex-col gap-3 py-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#666666]">Ciudad</label>
          <input
            autoFocus
            type="text"
            placeholder="Bogotá"
            value={newCiudad}
            onChange={(e) => setNewCiudad(e.target.value)}
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
      </div>
    </Modal>
  );
}

export default NewAddressModal;
