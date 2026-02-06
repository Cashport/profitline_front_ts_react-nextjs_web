import { useEffect, useState } from "react";
import * as yup from "yup";
import { Modal, Spin } from "antd";
import { useForm, Controller } from "react-hook-form";
import { Save } from "lucide-react";

import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";
import { Label } from "@/modules/chat/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/modules/chat/ui/select";

import {
  IGetCatalogs,
  ICatalogSelectOption,
  ICatalogMaterial
} from "@/types/dataQuality/IDataQuality";
import {
  getCatalogMaterialsForSelect,
  getCatalogMaterialType,
  getMaterialProductType
} from "@/services/dataQuality/dataQuality";

export const catalogFormSchema = yup.object().shape({
  customer_product_cod: yup
    .string()
    .required("El código del cliente es requerido")
    .min(1, "El código debe tener al menos 1 caracter"),
  customer_product_description: yup
    .string()
    .required("El producto del cliente es requerido")
    .min(1, "La descripción debe tener al menos 1 caracter"),
  material_code: yup.string().required("El material es requerido"),
  product_type: yup.string().required("El tipo de producto es requerido"),
  type_vol: yup.string().required("El tipo de volumen es requerido"),
  factor: yup
    .number()
    .typeError("El factor debe ser un número")
    .required("El factor es requerido")
    .positive("El factor debe ser positivo")
});

export type CatalogFormData = yup.InferType<typeof catalogFormSchema>;

const INITIAL_VALUES: CatalogFormData = {
  customer_product_cod: "",
  customer_product_description: "",
  material_code: "",
  product_type: "",
  type_vol: "",
  factor: undefined as unknown as number
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  catalogData?: IGetCatalogs | null;
  onSave: (data: CatalogFormData) => void;
  isLoadingCreateEdit?: boolean;
}

export default function ModalAddEditCatalog({
  isOpen,
  onClose,
  mode,
  catalogData,
  onSave,
  isLoadingCreateEdit = false
}: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset
  } = useForm<CatalogFormData>({
    resolver: yupResolver(catalogFormSchema),
    defaultValues: INITIAL_VALUES,
    mode: "onChange"
  });

  const [selectOptions, setSelectOptions] = useState<{
    materials: ICatalogMaterial[];
    productTypes: ICatalogSelectOption[];
    typeVols: ICatalogSelectOption[];
  }>({
    materials: [],
    productTypes: [],
    typeVols: []
  });

  // Inicializar form en modo edición
  useEffect(() => {
    if (isOpen && mode === "edit" && catalogData) {
      reset({
        customer_product_cod: catalogData.customer_product_cod,
        customer_product_description: catalogData.customer_product_description,
        material_code: String(catalogData.material_id),
        product_type: String(catalogData.product_type_id),
        type_vol: String(catalogData.type_vol_id),
        factor: catalogData.factor
      });
    }
    if (!isOpen) {
      reset(INITIAL_VALUES);
    }
  }, [isOpen, mode, catalogData, reset]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materials, typeVols, productTypes] = await Promise.all([
          getCatalogMaterialsForSelect(),
          getCatalogMaterialType(),
          getMaterialProductType()
        ]);

        setSelectOptions({
          materials,
          productTypes,
          typeVols
        });
      } catch (error) {
        console.error("Error fetching catalog data:", error);
      }
    };
    fetchData();
  }, []);

  const handleFormSubmit = (data: CatalogFormData) => {
    onSave(data);
  };

  const handleClose = () => {
    reset(INITIAL_VALUES);
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

          {/* Campo 3: Material */}
          <div className="grid gap-2">
            <Label htmlFor="materialCode" style={{ color: "#141414" }}>
              Material
            </Label>
            <Controller
              name="material_code"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    style={{
                      borderColor: errors.material_code ? "#ff4d4f" : "#DDDDDD"
                    }}
                  >
                    <SelectValue placeholder="Seleccionar material" />
                  </SelectTrigger>
                  <SelectContent className="!z-[10000]">
                    {selectOptions.materials.map((material) => (
                      <SelectItem key={material.id} value={String(material.id)}>
                        {material.material_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.material_code && (
              <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                {errors.material_code.message}
              </span>
            )}
          </div>

          {/* Campo 4: Tipo Producto */}
          <div className="grid gap-2">
            <Label htmlFor="productType" style={{ color: "#141414" }}>
              Tipo producto
            </Label>
            <Controller
              name="product_type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    style={{
                      borderColor: errors.product_type ? "#ff4d4f" : "#DDDDDD"
                    }}
                  >
                    <SelectValue placeholder="Seleccionar tipo de producto" />
                  </SelectTrigger>
                  <SelectContent className="!z-[10000]">
                    {selectOptions.productTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.product_type && (
              <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                {errors.product_type.message}
              </span>
            )}
          </div>

          {/* Campo 5: Tipo Volumen */}
          <div className="grid gap-2">
            <Label htmlFor="typeVol" style={{ color: "#141414" }}>
              Tipo volumen
            </Label>
            <Controller
              name="type_vol"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    style={{
                      borderColor: errors.type_vol ? "#ff4d4f" : "#DDDDDD"
                    }}
                  >
                    <SelectValue placeholder="Seleccionar tipo de volumen" />
                  </SelectTrigger>
                  <SelectContent className="!z-[10000]">
                    {selectOptions.typeVols.map((vol) => (
                      <SelectItem key={vol.id} value={String(vol.id)}>
                        {vol.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type_vol && (
              <span style={{ color: "#ff4d4f", fontSize: "12px" }}>{errors.type_vol.message}</span>
            )}
          </div>

          {/* Campo 6: Factor */}
          <div className="grid gap-2">
            <Label htmlFor="factor" style={{ color: "#141414" }}>
              Factor
            </Label>
            <Controller
              name="factor"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="factor"
                  type="number"
                  step="any"
                  placeholder="Ej: 2"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? undefined : Number(val));
                  }}
                  style={{
                    borderColor: errors.factor ? "#ff4d4f" : "#DDDDDD"
                  }}
                />
              )}
            />
            {errors.factor && (
              <span style={{ color: "#ff4d4f", fontSize: "12px" }}>{errors.factor.message}</span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoadingCreateEdit || (mode === "edit" ? !isValid || !isDirty : !isValid)}
            style={{
              backgroundColor:
                isLoadingCreateEdit || (mode === "edit" ? !isValid || !isDirty : !isValid)
                  ? "#d9d9d9"
                  : "#CBE71E",
              color: "#141414",
              border: "none",
              cursor:
                isLoadingCreateEdit || (mode === "edit" ? !isValid || !isDirty : !isValid)
                  ? "not-allowed"
                  : "pointer"
            }}
          >
            {isLoadingCreateEdit ? (
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
