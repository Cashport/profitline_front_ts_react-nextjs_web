"use client";

import { useEffect, useState } from "react";
import * as yup from "yup";
import { Modal, Spin, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Save } from "lucide-react";

import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";
import { Label } from "@/modules/chat/ui/label";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import { createCatalogMaterialEquivalence } from "@/services/dataQuality/dataQuality";
import { IPostCatalogMaterialEquivalence } from "@/types/dataQuality/IDataQuality";

const equivalenceSchema = yup.object().shape({
  internal_sku: yup.string().required("El SKU es requerido"),
  internal_name: yup.string().required("El nombre del producto es requerido"),
  conversion_factor: yup
    .number()
    .typeError("El factor debe ser un número")
    .required("El factor es requerido")
    .positive("El factor debe ser positivo"),
  valid_from: yup.string().required("La fecha 'Desde' es requerida"),
  is_active: yup.number().oneOf([0, 1]).required(),
  valid_to: yup
    .string()
    .nullable()
    .when("is_active", {
      is: 0,
      then: (schema) => schema.required("La fecha 'Hasta' es requerida"),
      otherwise: (schema) => schema.nullable()
    })
});

type EquivalenceFormData = {
  internal_sku: string;
  internal_name: string;
  conversion_factor: number;
  valid_from: string;
  valid_to?: string | null;
  is_active: 0 | 1;
};

const INITIAL_VALUES: EquivalenceFormData = {
  internal_sku: "",
  internal_name: "",
  conversion_factor: 1,
  valid_from: "",
  valid_to: "",
  is_active: 1
};

interface ModalAddMaterialEquivalencesProps {
  isOpen: boolean;
  onClose: () => void;
  catalogMaterialId: number;
  onCreated?: () => void;
}

export function ModalAddMaterialEquivalences({
  isOpen,
  onClose,
  catalogMaterialId,
  onCreated
}: ModalAddMaterialEquivalencesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<EquivalenceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(equivalenceSchema) as any,
    defaultValues: INITIAL_VALUES,
    mode: "onChange"
  });

  const isActive = watch("is_active");

  useEffect(() => {
    if (!isOpen) reset(INITIAL_VALUES);
  }, [isOpen, reset]);

  const handleClose = () => {
    reset(INITIAL_VALUES);
    onClose();
  };

  const onSubmit = async (data: EquivalenceFormData) => {
    try {
      setIsSubmitting(true);
      const body: IPostCatalogMaterialEquivalence = {
        internal_sku: data.internal_sku,
        internal_name: data.internal_name,
        conversion_factor: data.conversion_factor,
        valid_from: data.valid_from,
        valid_to: data.is_active === 1 ? null : data.valid_to ?? null,
        is_active: data.is_active
      };
      await createCatalogMaterialEquivalence(catalogMaterialId, body);
      message.success("Equivalencia creada correctamente");
      onCreated?.();
      handleClose();
    } catch (error) {
      console.error(error);
      message.error("Error al crear la equivalencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      closable={false}
      width={820}
      centered
      destroyOnClose
      styles={{ body: { padding: 0, backgroundColor: "#FFFFFF" } }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-5 border-b" style={{ borderColor: "#EEEEEE" }}>
        <h2 className="text-base font-semibold flex-1" style={{ color: "#141414" }}>
          Nueva equivalencia
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Body */}
        <div className="py-6">
          {/* Row 1: SKU + Nombre producto */}
          <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "1fr 2fr" }}>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium" style={{ color: "#141414" }}>
                SKU
              </Label>
              <Controller
                name="internal_sku"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Ej: SKU-CEN-PERF-V3"
                    style={{ borderColor: errors.internal_sku ? "#ff4d4f" : "#DDDDDD" }}
                  />
                )}
              />
              {errors.internal_sku && (
                <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                  {errors.internal_sku.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium" style={{ color: "#141414" }}>
                Nombre del producto
              </Label>
              <Controller
                name="internal_name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Ej: Centrum Performance Ultra 60 Tabs"
                    style={{ borderColor: errors.internal_name ? "#ff4d4f" : "#DDDDDD" }}
                  />
                )}
              />
              {errors.internal_name && (
                <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                  {errors.internal_name.message}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Factor + Desde + Hasta + checkbox Activo */}
          <div className="grid gap-4 items-end" style={{ gridTemplateColumns: "80px 1fr 1fr auto" }}>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium" style={{ color: "#141414" }}>
                Factor
              </Label>
              <Controller
                name="conversion_factor"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? undefined : Number(val));
                    }}
                    style={{ borderColor: errors.conversion_factor ? "#ff4d4f" : "#DDDDDD" }}
                  />
                )}
              />
              {errors.conversion_factor && (
                <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                  {errors.conversion_factor.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium" style={{ color: "#141414" }}>
                Desde
              </Label>
              <Controller
                name="valid_from"
                control={control}
                render={({ field }) => (
                  <Input
                    type="date"
                    {...field}
                    style={{ borderColor: errors.valid_from ? "#ff4d4f" : "#DDDDDD" }}
                  />
                )}
              />
              {errors.valid_from && (
                <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                  {errors.valid_from.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                className="text-sm font-medium"
                style={{ color: isActive === 1 ? "#BBBBBB" : "#141414" }}
              >
                Hasta
                {isActive === 1 && (
                  <span className="ml-1 text-xs font-normal" style={{ color: "#BBBBBB" }}>
                    (bloqueado — vigente)
                  </span>
                )}
              </Label>
              <Controller
                name="valid_to"
                control={control}
                render={({ field }) => (
                  <Input
                    type="date"
                    value={isActive === 1 ? "" : field.value ?? ""}
                    onChange={field.onChange}
                    disabled={isActive === 1}
                    style={{
                      borderColor: errors.valid_to ? "#ff4d4f" : "#DDDDDD",
                      opacity: isActive === 1 ? 0.4 : 1
                    }}
                  />
                )}
              />
              {errors.valid_to && (
                <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                  {errors.valid_to.message}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pb-[9px]">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="equivalence-active"
                    checked={field.value === 1}
                    onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                    style={
                      field.value === 1
                        ? { backgroundColor: "#CBE71E", borderColor: "#CBE71E" }
                        : {}
                    }
                  />
                )}
              />
              <Label
                htmlFor="equivalence-active"
                className="text-sm font-medium cursor-pointer"
                style={{ color: "#141414" }}
              >
                Activo
              </Label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="pt-4 border-t flex items-center justify-end gap-2"
          style={{ borderColor: "#EEEEEE" }}
        >
          <Button variant="outline" type="button" onClick={handleClose} className="bg-transparent">
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            style={{
              backgroundColor: !isValid || isSubmitting ? "#d9d9d9" : "#CBE71E",
              color: "#141414",
              border: "none",
              cursor: !isValid || isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? (
              <Spin size="small" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Guardar
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalAddMaterialEquivalences;
