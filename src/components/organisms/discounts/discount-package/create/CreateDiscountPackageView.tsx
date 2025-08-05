"use client";
import { Button, DatePicker, Flex, Switch, Table, Typography } from "antd";
import Link from "next/link";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import useCreateDiscountPackage from "./hooks/useCreateDiscountPackage";
import styles from "./CreateDiscountPackageView.module.scss";
import { Plus } from "phosphor-react";
import { Controller } from "react-hook-form";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { discountsFormColumns } from "../../constants/column";
import { DividerCustom } from "@/components/atoms/DividerCustom/DividerCustom";
import AddDiscountModal from "@/components/molecules/modals/AddDiscountModal/AddDiscountModal";
import { useMemo, useState } from "react";
import { Discount } from "@/types/discount/DiscountPackage";
import GroupClientsPackage from "./components/GroupClientsPackage";

type Props = {
  params?: { id: string };
};
export type TypeDiscount = "principal" | "additional";
const { Title, Text } = Typography;

export function CreateDiscountPackageView({ params }: Readonly<Props>) {
  const {
    handleExecCallback,
    loading,
    statusForm,
    contextHolder,
    setIsModalOpen,
    isModalOpen,
    errors,
    control,
    primaryDiscountsFields,
    secondaryDiscountsFields,
    trigger,
    watch,
    appendDiscount,
    appendAdditionalDiscount,
    removeDiscount,
    removeAdditionalDiscount,
    isLoadingSelect,
    optionsDiscounts,
    discountList,
    //discountId,
    isFormDisabled,
    form,
    clients,
    isLoadingClients
  } = useCreateDiscountPackage({ params });

  const [typeDiscount, setTypeDiscount] = useState<TypeDiscount | null>(null);

  const handleConfirmModal = (id: number) => {
    const completeOptionSelected = discountList?.find((d) => d.id === id);
    if (completeOptionSelected) {
      if (typeDiscount === "principal") {
        appendDiscount(completeOptionSelected);
      } else appendAdditionalDiscount(completeOptionSelected);
    }
  };

  function filterAvailableDiscountOptions(
    optionsDiscounts: { value: number; label: string }[] | undefined,
    discounts: Discount[] = [],
    additionalDiscounts: Discount[] = []
  ): { value: number; label: string }[] | undefined {
    if (!optionsDiscounts) return undefined;

    const usedDiscountIds = new Set([
      ...discounts.map((discount) => discount.packageId),
      ...additionalDiscounts.map((discount) => discount.packageId)
    ]);

    return optionsDiscounts.filter((option) => !usedDiscountIds.has(option.value));
  }
  const filteredOptions = useMemo(
    () =>
      filterAvailableDiscountOptions(
        optionsDiscounts,
        primaryDiscountsFields,
        secondaryDiscountsFields
      ),
    [optionsDiscounts, primaryDiscountsFields, secondaryDiscountsFields]
  );

  return (
    <>
      {contextHolder}
      <Flex className={styles.mainCreateDiscount}>
        <Flex className={styles.HeaderContainer} vertical gap={20}>
          {/* <Flex gap={20} justify="space-between">
            {statusForm !== "create" && (
              <Button
                className={styles.buttonEdit}
                htmlType="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleChangeStatusForm(statusForm === "review" ? "edit" : "review");
                }}
                loading={false}
              >
                {statusForm === "review" ? "Editar Descuento" : "Cancelar Edicion"}
                <Pencil size={"1.2rem"} />
              </Button>
            )}
          </Flex> */}
          <Title level={4}>Descripción</Title>
          <Flex gap={20}>
            <InputForm
              control={control}
              error={errors.name}
              nameInput="name"
              titleInput="Nombre"
              className={styles.input}
            />
            <InputForm
              control={control}
              error={errors.description}
              nameInput="description"
              titleInput="Descripción"
              className={styles.inputDesc}
            />
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
                name="startDate"
                control={control}
                render={({ field: { value, ...field } }) => {
                  return (
                    <>
                      <Text type="secondary">Inicio</Text>
                      <DatePicker
                        className={styles.inputDatePicker}
                        placeholder="Inicio"
                        type="secondary"
                        format="YYYY-MM-DD"
                        value={value}
                        {...field}
                      />
                      <Text type="danger" style={{ textWrap: "wrap" }} hidden={!errors.startDate}>
                        {errors?.startDate?.message}
                      </Text>
                    </>
                  );
                }}
              />
            </Flex>
            <Flex vertical>
              <Controller
                name="endDate"
                control={control}
                render={({ field: { onChange, ...field } }) => {
                  return (
                    <>
                      <Text type="secondary">Fin</Text>
                      <DatePicker
                        disabled={watch("is_active")}
                        className={styles.inputDatePicker}
                        placeholder="Fin"
                        type="secondary"
                        onChange={(e) => {
                          onChange(e);
                          trigger("endDate");
                        }}
                        {...field}
                      ></DatePicker>
                      <Text type="danger" hidden={!errors.endDate}>
                        {errors?.endDate?.message}
                      </Text>
                    </>
                  );
                }}
              />
            </Flex>
          </Flex>
          <DividerCustom />
          <Flex gap={20} vertical>
            <Flex vertical gap={24}>
              <Title level={4}>Descuento</Title>
              <Title level={5}>Selecciona un grupo de clientes</Title>
              <GroupClientsPackage
                error={errors.client_groups}
                form={form}
                loading={isLoadingClients}
                statusForm={statusForm}
                clients={clients}
              />
              <>
                <Table
                  dataSource={primaryDiscountsFields}
                  columns={discountsFormColumns({ remove: removeDiscount, isFormDisabled })}
                  pagination={false}
                />
                <Text type="danger" hidden={!errors.primaryDiscounts}>
                  {errors?.primaryDiscounts?.message}
                </Text>
              </>
              {!isFormDisabled && (
                <Flex justify="flex-end">
                  <PrincipalButton
                    onClick={() => {
                      setTypeDiscount("principal");
                      setIsModalOpen(true);
                    }}
                    icon={<Plus />}
                    iconPosition="end"
                    disabled={isFormDisabled}
                  >
                    Agregar regla de descuento
                  </PrincipalButton>
                </Flex>
              )}
            </Flex>
            <Flex vertical gap={24}>
              <Title level={4}>Descuento adicional</Title>
              <Table
                dataSource={secondaryDiscountsFields}
                columns={discountsFormColumns({ remove: removeAdditionalDiscount, isFormDisabled })}
                pagination={false}
              />
              {!isFormDisabled && (
                <Flex justify="flex-end">
                  <PrincipalButton
                    onClick={() => {
                      setTypeDiscount("additional");
                      setIsModalOpen(true);
                    }}
                    icon={<Plus />}
                    iconPosition="end"
                    disabled={isFormDisabled}
                  >
                    Agregar regla de descuento
                  </PrincipalButton>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Flex>
        <Flex gap={20} justify="space-between">
          <Link href="/descuentos" passHref legacyBehavior>
            <Button
              style={{ height: "100%", backgroundColor: "#d3d3d3" }}
              className={styles.buttonEdit}
            >
              Volver a la lista
            </Button>
          </Link>
          {statusForm !== "review" && (
            <PrincipalButton
              className={styles.button}
              onClick={handleExecCallback}
              loading={loading}
            >
              Crear paquete de descuentos
              {/* {discountId ? "Guardar cambios" : "Crear paquete de descuentos"} */}
            </PrincipalButton>
          )}
        </Flex>
      </Flex>
      <AddDiscountModal
        isModalOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTypeDiscount(null);
        }}
        onConfirm={(id: number) => handleConfirmModal(id)}
        options={filteredOptions ?? []}
        isLoading={isLoadingSelect}
      />
    </>
  );
}
