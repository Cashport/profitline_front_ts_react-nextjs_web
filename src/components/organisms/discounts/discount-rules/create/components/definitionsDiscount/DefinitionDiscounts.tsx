import { Controller, UseFormReturn } from "react-hook-form";
import style from "./DefinitionDiscounts.module.scss";
import { Button, DatePicker, Flex, Select, Switch, Typography } from "antd";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import FeatByOrder from "./feats/featByOrder/FeatByOrder";
import FeatByCient from "./feats/featByClient/FeatByClient";
import { getOptionsByType } from "../../../../constants/discountTypes";
import { useEffect, useMemo, useState } from "react";
import { DiscountSchema } from "../../resolvers/generalResolver";
import { Pencil } from "phosphor-react";

const { Title, Text } = Typography;

const byOrderTypes = [1, 2, 3, 4];
const byClientTypes = [5, 6];

type Props = {
  selectedType: number;
  form: UseFormReturn<DiscountSchema, any, undefined>;
  discountId?: number;
  statusForm: "create" | "edit" | "review";
  // eslint-disable-next-line no-unused-vars
  handleChangeStatusForm: (status: "create" | "edit" | "review") => void;
  loadingMain: boolean;
};

export default function DefinitionDiscounts({
  selectedType,
  form,
  discountId,
  statusForm,
  handleChangeStatusForm,
  loadingMain
}: Props) {
  const {
    watch,
    setValue,
    getValues,
    trigger,
    control,
    formState: { errors }
  } = form;

  const options = useMemo(() => getOptionsByType(selectedType), [selectedType]);

  const [oldValue, setOldValue] = useState<Date | undefined>(undefined);
  useEffect(() => {
    if (statusForm !== "review") {
      if (watch("is_active")) {
        setOldValue(getValues("end_date"));
        setValue("end_date", undefined, { shouldValidate: true });
      } else {
        setValue("end_date", oldValue, { shouldValidate: true });
      }
    } else setOldValue(getValues("end_date"));
  }, [watch("start_date"), watch("is_active")]);

  return (
    <Flex className={style.HeaderContainer} vertical gap={20}>
      <Flex gap={20} justify="space-between">
        <Title level={4}>Definiciones</Title>
        {statusForm !== "create" && (
          <Button
            className={style.buttonEdit}
            htmlType="button"
            onClick={(e) => {
              e.preventDefault();
              handleChangeStatusForm(statusForm === "review" ? "edit" : "review");
            }}
            loading={loadingMain}
          >
            {statusForm === "review" ? "Editar Descuento" : "Cancelar Edicion"}
            <Pencil size={"1.2rem"} />
          </Button>
        )}
      </Flex>
      <Flex vertical>
        <Text type="secondary">Tipo de descuento</Text>
        <Controller
          name="discount_type"
          rules={{ required: true }}
          control={control}
          render={({ field }) => {
            return (
              <>
                <Select
                  placeholder="Tipo de descuento"
                  placement="bottomLeft"
                  labelRender={(e) => e.label}
                  className={`${style.selectInput} translate `}
                  loading={false}
                  variant={"borderless"}
                  optionLabelProp="label"
                  options={options}
                  disabled={!!discountId}
                  {...field}
                ></Select>
                <Text type="danger" hidden={!errors.discount_type}>
                  {errors?.discount_type?.message}
                </Text>
              </>
            );
          }}
        />
      </Flex>
      <Title level={4}>Descripción</Title>
      <Flex gap={20}>
        <InputForm
          control={control}
          error={errors.name}
          nameInput="name"
          titleInput="Nombre"
          className={style.input}
        ></InputForm>
        <InputForm
          control={control}
          error={errors.description}
          nameInput="description"
          titleInput="Descripción"
          className={style.inputDesc}
        ></InputForm>
      </Flex>
      <Title level={4}>Fechas</Title>
      <Controller
        name="is_active"
        control={control}
        render={({ field }) => {
          return (
            <Flex gap={40} align="center">
              <Switch
                style={{ width: "fit-content", transform: "scale(2) translateX(25%)" }}
                size="small"
                {...field}
              />
              <Text type="secondary">No tiene fin</Text>
            </Flex>
          );
        }}
      />
      <Flex gap={20}>
        <Flex vertical>
          <Controller
            name="start_date"
            control={control}
            render={({ field: { value, ...field } }) => {
              return (
                <>
                  <Text type="secondary">Inicio</Text>
                  <DatePicker
                    className={style.inputDatePicker}
                    placeholder="Inicio"
                    type="secondary"
                    format="YYYY-MM-DD"
                    value={value}
                    {...field}
                  ></DatePicker>
                  <Text type="danger" style={{ textWrap: "wrap" }} hidden={!errors.start_date}>
                    {errors?.start_date?.message}
                  </Text>
                </>
              );
            }}
          />
        </Flex>
        <Flex vertical>
          <Controller
            name="end_date"
            control={control}
            render={({ field: { onChange, ...field } }) => {
              return (
                <>
                  <Text type="secondary">Fin</Text>
                  <DatePicker
                    disabled={watch("is_active")}
                    className={style.inputDatePicker}
                    placeholder="Fin"
                    type="secondary"
                    onChange={(e) => {
                      onChange(e);
                      trigger("end_date");
                    }}
                    {...field}
                  ></DatePicker>
                  <Text type="danger" hidden={!errors.end_date}>
                    {errors?.end_date?.message}
                  </Text>
                </>
              );
            }}
          />
        </Flex>
      </Flex>
      <hr></hr>
      <Title level={4}>Características del descuento</Title>
      {byOrderTypes.includes(watch("discount_type") || 0) && (
        <FeatByOrder
          discountType={watch("discount_type") || 0}
          form={form}
          statusForm={statusForm}
        ></FeatByOrder>
      )}
      {byClientTypes.includes(watch("discount_type") || 0) && (
        <FeatByCient
          discountType={watch("discount_type") || 0}
          form={form}
          statusForm={statusForm}
        ></FeatByCient>
      )}
    </Flex>
  );
}
