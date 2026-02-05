import { Modal } from "antd";
import { Save } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";
import { Label } from "@/modules/chat/ui/label";
import { IGetCatalogs } from "@/types/dataQuality/IDataQuality";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: IGetCatalogs | null;
  setEditingItem: (item: IGetCatalogs | null) => void;
  onSave: () => void;
}

export default function ModalAddEditCatalog({
  isOpen,
  onClose,
  editingItem,
  setEditingItem,
  onSave
}: Props) {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
      title={editingItem ? "Editar Equivalencia" : "Nueva Equivalencia"}
    >
      <p style={{ color: "#8c8c8c" }}>
        {editingItem
          ? "Modifica la equivalencia del producto."
          : "Crea una nueva equivalencia de producto."}
      </p>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="clientCode" style={{ color: "#141414" }}>
            Código del Cliente
          </Label>
          <Input
            id="clientCode"
            value={editingItem?.customer_product_cod || ""}
            onChange={(e) =>
              setEditingItem(
                editingItem ? { ...editingItem, customer_product_cod: e.target.value } : null
              )
            }
            placeholder="Ej: DLX001"
            style={{ borderColor: "#DDDDDD" }}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="clientProduct" style={{ color: "#141414" }}>
            Producto del Cliente
          </Label>
          <Input
            id="clientProduct"
            value={editingItem?.customer_product_description || ""}
            onChange={(e) =>
              setEditingItem(
                editingItem
                  ? { ...editingItem, customer_product_description: e.target.value }
                  : null
              )
            }
            placeholder="Ej: DOLEX x6 presentación MAX"
            style={{ borderColor: "#DDDDDD" }}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="productName" style={{ color: "#141414" }}>
            Nombre del Producto
          </Label>
          <Input
            id="productName"
            value={editingItem?.material_name || ""}
            onChange={(e) =>
              setEditingItem(
                editingItem ? { ...editingItem, material_name: e.target.value } : null
              )
            }
            placeholder="Ej: Dolex Max X6 Und"
            style={{ borderColor: "#DDDDDD" }}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          style={{
            backgroundColor: "#CBE71E",
            color: "#141414",
            border: "none"
          }}
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar
        </Button>
      </div>
    </Modal>
  );
}
