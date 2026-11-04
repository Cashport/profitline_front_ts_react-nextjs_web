import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { Modal, Spin } from "antd";
import { useForm, Controller } from "react-hook-form";
import { Save } from "lucide-react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations } from "use-intl";
import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";
import { Label } from "@/modules/chat/ui/label";
import { Switch } from "@/modules/chat/ui/switch";
import Select from "@/modules/dataQuality/components/atoms/select/Select";

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

type MaterialFormT = ReturnType<typeof useTranslations<"dataQuality.materialForm">>;

export const buildCatalogFormSchema = (t: MaterialFormT) =>
  yup.object().shape({
    customer_product_cod: yup
      .string()
      .required(t("validation.customerCode"))
      .min(1, t("validation.codeMin")),
    customer_product_description: yup
      .string()
      .required(t("validation.customerProduct"))
      .min(1, t("validation.descriptionMin")),
    material_code: yup.string().required(t("validation.material")),
    product_type: yup.string().required(t("validation.productType")),
    type_vol: yup.string().required(t("validation.volumeType")),
    factor: yup
      .number()
      .typeError(t("validation.factorNumber"))
      .required(t("validation.factorRequired"))
      .positive(t("validation.factorPositive")),
    excluded: yup.boolean().default(false)
  });

export type CatalogFormData = yup.InferType<ReturnType<typeof buildCatalogFormSchema>>;

const INITIAL_VALUES: CatalogFormData = {
  customer_product_cod: "",
  customer_product_description: "",
  material_code: "",
  product_type: "",
  type_vol: "",
  factor: undefined as unknown as number,
  excluded: false
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  catalogData?: IGetCatalogs | null;
  onSave: (data: CatalogFormData) => void;
  countryId: number;
  isLoadingCreateEdit?: boolean;
}

export default function ModalAddEditCatalog({
  isOpen,
  onClose,
  mode,
  catalogData,
  onSave,
  countryId,
  isLoadingCreateEdit = false
}: Props) {
  const t = useTranslations("dataQuality.materialForm");
  const tCommon = useTranslations("common");
  const catalogFormSchema = useMemo(() => buildCatalogFormSchema(t), [t]);
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
        factor: catalogData.factor,
        excluded: catalogData.excluded === 1
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
          getCatalogMaterialsForSelect(countryId),
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
      title={mode === "edit" ? t("editEquivalenceTitle") : t("newEquivalenceTitle")}
    >
      <p style={{ color: "#8c8c8c" }}>
        {mode === "edit" ? t("editEquivalenceDescription") : t("newEquivalenceDescription")}
      </p>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid gap-4 py-4">
          {/* Campo 1: Código del Cliente */}
          <div className="grid gap-2">
            <Label htmlFor="clientCode" style={{ color: "#141414" }}>
              {t("customerCode")}
            </Label>
            <Controller
              name="customer_product_cod"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="clientCode"
                  placeholder={t("customerCodePlaceholder")}
                  style={{ borderColor: errors.customer_product_cod ? "#ff4d4f" : "#DDDDDD" }}
                />
              )}
            />
            {errors.customer_product_cod && (
              <span style={{ color: "#ff4d4f", fontSize: "13px" }}>
                {errors.customer_product_cod.message}
              </span>
            )}
          </div>

          {/* Campo 2: Producto del Cliente */}
          <div className="grid gap-2">
            <Label htmlFor="clientProduct" style={{ color: "#141414" }}>
              {t("customerProduct")}
            </Label>
            <Controller
              name="customer_product_description"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="clientProduct"
                  placeholder={t("customerProductPlaceholder")}
                  style={{
                    borderColor: errors.customer_product_description ? "#ff4d4f" : "#DDDDDD"
                  }}
                />
              )}
            />
            {errors.customer_product_description && (
              <span style={{ color: "#ff4d4f", fontSize: "13px" }}>
                {errors.customer_product_description.message}
              </span>
            )}
          </div>

          {/* Campo 3: Material */}
          <div className="grid gap-2">
            <Label htmlFor="materialCode" style={{ color: "#141414" }}>
              {t("material")}
            </Label>
            <Controller
              name="material_code"
              control={control}
              render={({ field }) => (
                <Select
                  showSearch
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("materialPlaceholder")}
                  hasError={!!errors.material_code}
                  options={selectOptions.materials.map((material) => ({
                    value: String(material.id),
                    label: `${material.material_code} - ${material.material_name}`
                  }))}
                />
              )}
            />
            {errors.material_code && (
              <span style={{ color: "#ff4d4f", fontSize: "13px" }}>
                {errors.material_code.message}
              </span>
            )}
          </div>

          {/* Campo 4: Tipo Producto */}
          <div className="grid gap-2">
            <Label htmlFor="productType" style={{ color: "#141414" }}>
              {t("productType")}
            </Label>
            <Controller
              name="product_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("productTypePlaceholder")}
                  hasError={!!errors.product_type}
                  options={selectOptions.productTypes.map((type) => ({
                    value: String(type.id),
                    label: type.name
                  }))}
                />
              )}
            />
            {errors.product_type && (
              <span style={{ color: "#ff4d4f", fontSize: "13px" }}>
                {errors.product_type.message}
              </span>
            )}
          </div>

          {/* Campo 5: Tipo Volumen */}
          <div className="grid gap-2">
            <Label htmlFor="typeVol" style={{ color: "#141414" }}>
              {t("volumeType")}
            </Label>
            <Controller
              name="type_vol"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("volumeTypePlaceholder")}
                  hasError={!!errors.type_vol}
                  options={selectOptions.typeVols.map((vol) => ({
                    value: String(vol.id),
                    label: vol.name
                  }))}
                />
              )}
            />
            {errors.type_vol && (
              <span style={{ color: "#ff4d4f", fontSize: "13px" }}>{errors.type_vol.message}</span>
            )}
          </div>

          {/* Campo 6: Factor */}
          <div className="grid gap-2">
            <Label htmlFor="factor" style={{ color: "#141414" }}>
              {t("factor")}
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
                  placeholder={t("factorPlaceholder")}
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
              <span style={{ color: "#ff4d4f", fontSize: "13px" }}>{errors.factor.message}</span>
            )}
          </div>

          {/* Campo 7: Exclusión */}
          <div className="grid gap-2">
            <Label htmlFor="excluded" style={{ color: "#141414" }}>
              {t("exclusion")}
            </Label>
            <Controller
              name="excluded"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Switch id="excluded" checked={!!field.value} onCheckedChange={field.onChange} />
                  <span style={{ color: field.value ? "#cf1322" : "#141414" }}>
                    {field.value ? t("excluded") : t("included")}
                  </span>
                </div>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} type="button">
            {tCommon("actions.cancel")}
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
                {tCommon("actions.save")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
