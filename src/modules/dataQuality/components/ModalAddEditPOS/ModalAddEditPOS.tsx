import { useState } from "react";
import * as yup from "yup";
import { Modal, Spin, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { Save } from "lucide-react";
import { yupResolver } from "@hookform/resolvers/yup";

import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";
import { Label } from "@/modules/chat/ui/label";

import { createPointOfSale } from "@/services/dataQuality/dataQuality";

const posFormSchema = yup.object().shape({
  pos_id: yup.string().required("El POS ID es requerido"),
  pos_name: yup.string().required("El nombre del POS es requerido"),
  ship_to: yup.string().optional(),
  pos_tax_code: yup.string().optional(),
  pos_chain_name: yup.string().optional(),
  pos_format_store: yup.string().optional(),
  pos_internal_zone: yup.string().optional(),
  pos_external_zone: yup.string().optional(),
  pos_neighborhood: yup.string().optional(),
  pos_address: yup.string().optional(),
  pos_supervisor: yup.string().optional(),
  pos_internal_sales_representative: yup.string().optional(),
  pos_external_sales_representative: yup.string().optional(),
  pos_cod_sfe: yup.string().optional(),
  id_pos_channel: yup.number().optional(),
  pos_active: yup.boolean().optional()
});

type PosFormData = yup.InferType<typeof posFormSchema>;

const INITIAL_VALUES: PosFormData = {
  pos_id: "",
  pos_name: "",
  ship_to: "",
  pos_tax_code: "",
  pos_chain_name: "",
  pos_format_store: "",
  pos_internal_zone: "",
  pos_external_zone: "",
  pos_neighborhood: "",
  pos_address: "",
  pos_supervisor: "",
  pos_internal_sales_representative: "",
  pos_external_sales_representative: "",
  pos_cod_sfe: "",
  id_pos_channel: undefined,
  pos_active: false
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  countryId: number;
  onSuccess?: () => void;
}

export default function ModalAddEditPOS({
  isOpen,
  onClose,
  clientId,
  countryId,
  onSuccess
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<PosFormData>({
    resolver: yupResolver(posFormSchema),
    defaultValues: INITIAL_VALUES,
    mode: "onChange"
  });

  const handleClose = () => {
    reset(INITIAL_VALUES);
    onClose();
  };

  const onSubmit = async (data: PosFormData) => {
    setIsLoading(true);
    try {
      await createPointOfSale({ ...data, id_client: clientId, id_country: countryId });
      message.success("POS creado exitosamente");
      onSuccess?.();
      handleClose();
    } catch {
      message.error("Error al crear el POS");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={686}
      destroyOnClose
      title="Nuevo POS"
    >
      <p style={{ color: "#8c8c8c" }}>Completa los datos para crear un nuevo Punto de Venta.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 py-4">
          {/* POS ID */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>
              POS ID <span style={{ color: "#ff4d4f" }}>*</span>
            </Label>
            <Controller
              name="pos_id"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ej: POS-001"
                  style={{ borderColor: errors.pos_id ? "#ff4d4f" : "#DDDDDD" }}
                />
              )}
            />
            {errors.pos_id && (
              <span style={{ color: "#ff4d4f", fontSize: "12px" }}>{errors.pos_id.message}</span>
            )}
          </div>

          {/* POS Name */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>
              Nombre del POS <span style={{ color: "#ff4d4f" }}>*</span>
            </Label>
            <Controller
              name="pos_name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ej: Tienda Central"
                  style={{ borderColor: errors.pos_name ? "#ff4d4f" : "#DDDDDD" }}
                />
              )}
            />
            {errors.pos_name && (
              <span style={{ color: "#ff4d4f", fontSize: "12px" }}>{errors.pos_name.message}</span>
            )}
          </div>

          {/* Ship To */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Ship To</Label>
            <Controller
              name="ship_to"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Ej: SH-001" />
              )}
            />
          </div>

          {/* Tax Code */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Tax Code</Label>
            <Controller
              name="pos_tax_code"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Ej: TAX-123" />
              )}
            />
          </div>

          {/* Chain Name */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Nombre de cadena</Label>
            <Controller
              name="pos_chain_name"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Ej: Cadena XYZ" />
              )}
            />
          </div>

          {/* Format Store */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Formato de tienda</Label>
            <Controller
              name="pos_format_store"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Ej: Supermercado" />
              )}
            />
          </div>

          {/* Internal Zone */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Zona interna</Label>
            <Controller
              name="pos_internal_zone"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Ej: Norte" />
              )}
            />
          </div>

          {/* External Zone */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Zona externa</Label>
            <Controller
              name="pos_external_zone"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Ej: Sur" />
              )}
            />
          </div>

          {/* Neighborhood */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Barrio</Label>
            <Controller
              name="pos_neighborhood"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Ej: Centro" />
              )}
            />
          </div>

          {/* Address */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Dirección</Label>
            <Controller
              name="pos_address"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Ej: Calle 123 #45-67" />
              )}
            />
          </div>

          {/* Supervisor */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Supervisor</Label>
            <Controller
              name="pos_supervisor"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Ej: Juan Pérez" />
              )}
            />
          </div>

          {/* POS Channel */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Canal POS</Label>
            <Controller
              name="id_pos_channel"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  placeholder="Ej: 1"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? undefined : Number(val));
                  }}
                />
              )}
            />
          </div>

          {/* Internal Sales Rep */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Representante de ventas interno</Label>
            <Controller
              name="pos_internal_sales_representative"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Ej: Ana García" />
              )}
            />
          </div>

          {/* External Sales Rep */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Representante de ventas externo</Label>
            <Controller
              name="pos_external_sales_representative"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Ej: Carlos López" />
              )}
            />
          </div>

          {/* COD SFE */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>COD SFE</Label>
            <Controller
              name="pos_cod_sfe"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Ej: SFE-001" />
              )}
            />
          </div>

          {/* Active */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>Activo</Label>
            <div className="flex items-center h-9">
              <Controller
                name="pos_active"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#CBE71E", cursor: "pointer" }}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !isValid}
            style={{
              backgroundColor: isLoading || !isValid ? "#d9d9d9" : "#CBE71E",
              color: "#141414",
              border: "none",
              cursor: isLoading || !isValid ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? (
              <Spin size="small" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
