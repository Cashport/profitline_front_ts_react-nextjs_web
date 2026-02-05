import { useEffect } from "react";
import * as yup from "yup";
import { Modal } from "antd";
import { useForm, Controller } from "react-hook-form";
import { Save } from "lucide-react";

import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";
import { Label } from "@/modules/chat/ui/label";

import { IGetCatalogs } from "@/types/dataQuality/IDataQuality";

export const catalogFormSchema = yup.object().shape({
  customer_product_cod: yup
    .string()
    .required("El código del cliente es requerido")
    .min(1, "El código debe tener al menos 1 caracter"),
  customer_product_description: yup
    .string()
    .required("El producto del cliente es requerido")
    .min(1, "La descripción debe tener al menos 1 caracter"),
  material_name: yup
    .string()
    .required("El nombre del producto es requerido")
    .min(1, "El nombre debe tener al menos 1 caracter")
});

export type CatalogFormData = yup.InferType<typeof catalogFormSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  catalogData?: IGetCatalogs | null;
  onSave: (data: CatalogFormData) => void;
}

export default function ModalAddEditCatalog({ isOpen, onClose, mode, catalogData, onSave }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue
  } = useForm<CatalogFormData>({
    resolver: yupResolver(catalogFormSchema),
    defaultValues: {
      customer_product_cod: "",
      customer_product_description: "",
      material_name: ""
    },
    mode: "onChange"
  });

  // Inicializar form en modo edición
  useEffect(() => {
    if (isOpen && mode === "edit" && catalogData) {
      setValue("customer_product_cod", catalogData.customer_product_cod);
      setValue("customer_product_description", catalogData.customer_product_description);
      setValue("material_name", catalogData.material_name);
    }
    if (!isOpen) {
      reset();
    }
  }, [isOpen, mode, catalogData, setValue, reset]);

  const handleFormSubmit = (data: CatalogFormData) => {
    onSave(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={600}
      destroyOnClose
      title={mode === "edit" ? "Editar Equivalencia" : "Nueva Equivalencia"}
    >
      <p style={{ color: "#8c8c8c" }}>
        {mode === "edit"
          ? "Modifica la equivalencia del producto."
          : "Crea una nueva equivalencia de producto."}
      </p>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid gap-4 py-4">
          {/* Campo 1: Código del Cliente */}
          <div className="grid gap-2">
            <Label htmlFor="clientCode" style={{ color: "#141414" }}>
              Código del Cliente
            </Label>
            <Controller
              name="customer_product_cod"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="clientCode"
                  placeholder="Ej: DLX001"
                  style={{ borderColor: errors.customer_product_cod ? "#ff4d4f" : "#DDDDDD" }}
                />
              )}
            />
            {errors.customer_product_cod && (
              <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                {errors.customer_product_cod.message}
              </span>
            )}
          </div>

          {/* Campo 2: Producto del Cliente */}
          <div className="grid gap-2">
            <Label htmlFor="clientProduct" style={{ color: "#141414" }}>
              Producto del Cliente
            </Label>
            <Controller
              name="customer_product_description"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="clientProduct"
                  placeholder="Ej: DOLEX x6 presentación MAX"
                  style={{
                    borderColor: errors.customer_product_description ? "#ff4d4f" : "#DDDDDD"
                  }}
                />
              )}
            />
            {errors.customer_product_description && (
              <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                {errors.customer_product_description.message}
              </span>
            )}
          </div>

          {/* Campo 3: Nombre del Producto */}
          <div className="grid gap-2">
            <Label htmlFor="productName" style={{ color: "#141414" }}>
              Nombre del Producto
            </Label>
            <Controller
              name="material_name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="productName"
                  placeholder="Ej: Dolex Max X6 Und"
                  style={{ borderColor: errors.material_name ? "#ff4d4f" : "#DDDDDD" }}
                />
              )}
            />
            {errors.material_name && (
              <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                {errors.material_name.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!isValid}
            style={{
              backgroundColor: !isValid ? "#d9d9d9" : "#CBE71E",
              color: "#141414",
              border: "none",
              cursor: !isValid ? "not-allowed" : "pointer"
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
