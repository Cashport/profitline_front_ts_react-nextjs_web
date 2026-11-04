import { useState, useEffect, useMemo } from "react";
import * as yup from "yup";
import { Modal, Spin, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { Save } from "lucide-react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations } from "use-intl";

import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";
import { Label } from "@/modules/chat/ui/label";
import Select from "@/modules/dataQuality/components/atoms/select/Select";

import {
  createPointOfSale,
  editPointOfSale,
  getAllPOSChannels,
  getAllPOSSubChannels,
  getAllCountries,
  getAllRegions
} from "@/services/dataQuality/dataQuality";
import { IPOS } from "@/types/dataQuality/IDataQuality";

type PosT = ReturnType<typeof useTranslations<"dataQuality.posModal">>;

const buildPosFormSchema = (t: PosT) =>
  yup.object().shape({
    sold_to: yup.number().required(),
    pos_id: yup.string().required(t("validation.posId")),
    pos_name: yup.string().required(t("validation.posName")),
    id_country: yup.number().required(t("validation.country")),
    department_id: yup.number().optional(),
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
    channel_id: yup.number().optional(),
    sub_channel_id: yup.number().optional(),
    pos_active: yup.boolean().optional()
  });

type PosFormData = yup.InferType<ReturnType<typeof buildPosFormSchema>>;

const INITIAL_VALUES: PosFormData = {
  sold_to: 0,
  pos_id: "",
  pos_name: "",
  id_country: 0,
  department_id: undefined,
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
  channel_id: undefined,
  sub_channel_id: undefined,
  pos_active: false
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  countryId: number;
  onSuccess?: () => void;
  mode: "create" | "edit";
  posData?: IPOS | null;
}

export default function ModalAddEditPOS({
  isOpen,
  onClose,
  clientId,
  countryId,
  onSuccess,
  mode,
  posData
}: Props) {
  const t = useTranslations("dataQuality.posModal");
  const tCommon = useTranslations("common");
  const posFormSchema = useMemo(() => buildPosFormSchema(t), [t]);
  const [isLoading, setIsLoading] = useState(false);

  const [channels, setChannels] = useState<{ id: number; name: string }[]>([]);
  const [subChannels, setSubChannels] = useState<{ id: number; name: string }[]>([]);
  const [countries, setCountries] = useState<{ id: number; country_name: string }[]>([]);
  const [regions, setRegions] = useState<{ id: number; region_name: string }[]>([]);
  const [isLoadingSubChannels, setIsLoadingSubChannels] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch
  } = useForm<PosFormData>({
    resolver: yupResolver(posFormSchema),
    defaultValues: { ...INITIAL_VALUES },
    mode: "onChange"
  });

  const watchedCountryId = watch("id_country");

  useEffect(() => {
    Promise.all([getAllPOSChannels(), getAllCountries()])
      .then(([ch, co]) => {
        setChannels(ch);
        setCountries(co);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isOpen && countryId) {
      setIsLoadingRegions(true);
      getAllRegions(countryId)
        .then(setRegions)
        .catch(console.error)
        .finally(() => setIsLoadingRegions(false));
    }
  }, [isOpen, countryId]);

  useEffect(() => {
    if (isOpen && mode === "edit" && posData) {
      reset({
        sold_to: clientId,
        pos_id: posData.pos_id,
        pos_name: posData.pos_name,
        id_country: countryId,
        department_id: posData.department_id,
        ship_to: posData.ship_to,
        pos_tax_code: posData.pos_tax_code,
        pos_chain_name: posData.pos_chain_name,
        pos_format_store: posData.pos_format_store,
        pos_internal_zone: posData.pos_internal_zone,
        pos_external_zone: posData.pos_external_zone,
        pos_neighborhood: posData.pos_neighborhood,
        pos_address: posData.pos_address,
        pos_supervisor: posData.pos_supervisor,
        pos_internal_sales_representative: posData.pos_internal_sales_representative,
        pos_external_sales_representative: posData.pos_external_sales_representative,
        pos_cod_sfe: posData.pos_cod_sfe,
        channel_id: posData.channel_id,
        sub_channel_id: posData.sub_channel_id,
        pos_active: posData.pos_active
      });

      if (posData.channel_id) {
        setIsLoadingSubChannels(true);
        getAllPOSSubChannels(posData.channel_id)
          .then(setSubChannels)
          .catch(console.error)
          .finally(() => setIsLoadingSubChannels(false));
      }
    }
    if (!isOpen) {
      reset({ ...INITIAL_VALUES, sold_to: clientId, id_country: countryId });
    }
  }, [isOpen, mode, posData, reset, countryId, clientId]);

  const handleChannelChange = async (channelId: number | undefined) => {
    setValue("channel_id", channelId);
    setValue("sub_channel_id", undefined);
    setSubChannels([]);
    if (channelId) {
      setIsLoadingSubChannels(true);
      try {
        const data = await getAllPOSSubChannels(channelId);
        setSubChannels(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingSubChannels(false);
      }
    }
  };

  const handleCountryChange = async (newCountryId: number | undefined) => {
    setValue("department_id", undefined);
    setRegions([]);
    if (newCountryId) {
      setIsLoadingRegions(true);
      try {
        const data = await getAllRegions(newCountryId);
        setRegions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingRegions(false);
      }
    }
  };

  const handleClose = () => {
    reset({ ...INITIAL_VALUES, sold_to: clientId, id_country: countryId });
    setSubChannels([]);
    setRegions([]);
    onClose();
  };

  const onSubmit = async (data: PosFormData) => {
    setIsLoading(true);
    try {
      if (mode === "edit" && posData) {
        await editPointOfSale(posData.id, data);
        message.success(t("updated"));
      } else {
        await createPointOfSale(data);
        message.success(t("created"));
      }
      onSuccess?.();
      handleClose();
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : mode === "edit"
            ? t("updateError")
            : t("createError")
      );
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
      title={mode === "edit" ? t("editTitle") : t("createTitle")}
      styles={{
        body: {
          maxHeight: "calc(70 * var(--vh) - 55px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }
      }}
    >
      <p style={{ color: "#8c8c8c" }}>
        {mode === "edit" ? t("editDescription") : t("createDescription")}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0
        }}
      >
        <div
          className="grid grid-cols-2 gap-4 py-4"
          style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin", minHeight: 0 }}
        >
          {/* POS ID */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>
              {t("posId")} <span style={{ color: "#ff4d4f" }}>*</span>
            </Label>
            <Controller
              name="pos_id"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={t("posIdPlaceholder")}
                  style={{ borderColor: errors.pos_id ? "#ff4d4f" : "#DDDDDD" }}
                />
              )}
            />
            {errors.pos_id && (
              <span style={{ color: "#ff4d4f", fontSize: "13px" }}>{errors.pos_id.message}</span>
            )}
          </div>

          {/* POS Name */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>
              {t("posName")} <span style={{ color: "#ff4d4f" }}>*</span>
            </Label>
            <Controller
              name="pos_name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={t("posNamePlaceholder")}
                  style={{ borderColor: errors.pos_name ? "#ff4d4f" : "#DDDDDD" }}
                />
              )}
            />
            {errors.pos_name && (
              <span style={{ color: "#ff4d4f", fontSize: "13px" }}>{errors.pos_name.message}</span>
            )}
          </div>

          {/* Canal → channel_id */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("channel")}</Label>
            <Controller
              name="channel_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString()}
                  onChange={(val) => handleChannelChange(val ? Number(val) : undefined)}
                  options={channels.map((c) => ({ value: c.id.toString(), label: c.name }))}
                  placeholder={t("channelPlaceholder")}
                />
              )}
            />
          </div>

          {/* Sub Canal → sub_channel_id */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("subChannel")}</Label>
            <Controller
              name="sub_channel_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString()}
                  onChange={(val) => field.onChange(val ? Number(val) : undefined)}
                  options={subChannels.map((s) => ({ value: s.id.toString(), label: s.name }))}
                  placeholder={t("subChannelPlaceholder")}
                  disabled={!watch("channel_id")}
                  loading={isLoadingSubChannels}
                />
              )}
            />
          </div>

          {/* País → id_country */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>
              {t("country")} <span style={{ color: "#ff4d4f" }}>*</span>
            </Label>
            <Controller
              name="id_country"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? field.value.toString() : undefined}
                  onChange={(val) => {
                    const num = val ? Number(val) : undefined;
                    field.onChange(num);
                    handleCountryChange(num);
                  }}
                  options={countries.map((c) => ({
                    value: c.id.toString(),
                    label: c.country_name
                  }))}
                  placeholder={t("countryPlaceholder")}
                  hasError={!!errors.id_country}
                />
              )}
            />
            {errors.id_country && (
              <span style={{ color: "#ff4d4f", fontSize: "13px" }}>
                {errors.id_country.message}
              </span>
            )}
          </div>

          {/* Región → department_id */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("region")}</Label>
            <Controller
              name="department_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString()}
                  onChange={(val) => field.onChange(val ? Number(val) : undefined)}
                  options={regions.map((r) => ({ value: r.id.toString(), label: r.region_name }))}
                  placeholder={t("regionPlaceholder")}
                  disabled={!watchedCountryId}
                  loading={isLoadingRegions}
                />
              )}
            />
          </div>

          {/* Ship To */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("shipTo")}</Label>
            <Controller
              name="ship_to"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder={t("shipToPlaceholder")} />
              )}
            />
          </div>

          {/* Tax Code */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("taxCode")}</Label>
            <Controller
              name="pos_tax_code"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder={t("taxCodePlaceholder")} />
              )}
            />
          </div>

          {/* Chain Name */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("chainName")}</Label>
            <Controller
              name="pos_chain_name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("chainNamePlaceholder")}
                />
              )}
            />
          </div>

          {/* Format Store */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("storeFormat")}</Label>
            <Controller
              name="pos_format_store"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("storeFormatPlaceholder")}
                />
              )}
            />
          </div>

          {/* Internal Zone */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("internalZone")}</Label>
            <Controller
              name="pos_internal_zone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("internalZonePlaceholder")}
                />
              )}
            />
          </div>

          {/* External Zone */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("externalZone")}</Label>
            <Controller
              name="pos_external_zone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("externalZonePlaceholder")}
                />
              )}
            />
          </div>

          {/* Neighborhood */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("neighborhood")}</Label>
            <Controller
              name="pos_neighborhood"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("neighborhoodPlaceholder")}
                />
              )}
            />
          </div>

          {/* Address */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("address")}</Label>
            <Controller
              name="pos_address"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder={t("addressPlaceholder")} />
              )}
            />
          </div>

          {/* Supervisor */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("supervisor")}</Label>
            <Controller
              name="pos_supervisor"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("supervisorPlaceholder")}
                />
              )}
            />
          </div>

          {/* Internal Sales Rep */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("internalSalesRep")}</Label>
            <Controller
              name="pos_internal_sales_representative"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("internalSalesRepPlaceholder")}
                />
              )}
            />
          </div>

          {/* External Sales Rep */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("externalSalesRep")}</Label>
            <Controller
              name="pos_external_sales_representative"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("externalSalesRepPlaceholder")}
                />
              )}
            />
          </div>

          {/* COD SFE */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("codSfe")}</Label>
            <Controller
              name="pos_cod_sfe"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder={t("codSfePlaceholder")} />
              )}
            />
          </div>

          {/* Active */}
          <div className="grid gap-2">
            <Label style={{ color: "#141414" }}>{t("active")}</Label>
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
            {tCommon("actions.cancel")}
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
                {tCommon("actions.save")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
