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
import { useTranslations } from "use-intl";
import { Discount } from "@/types/discount/DiscountPackage";
import GroupClientsPackage from "./components/GroupClientsPackage";

type Props = {
  params?: { id?: string; basePath?: string; listPath?: string };
};
export type TypeDiscount = "principal" | "additional";
const { Title, Text } = Typography;

export function CreateDiscountPackageView({ params }: Readonly<Props>) {
  const t = useTranslations("discounts");
  const tColumns = useTranslations("discounts.columns");
  const tCommon = useTranslations("common");
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
    optionsPrimaryDiscounts,
    optionsSecondaryDiscounts,
    primaryDiscountList,
    secondaryDiscountList,
    //discountId,
    isFormDisabled,
    form,
    clients,
    isLoadingClients,
    listPath
  } = useCreateDiscountPackage({ params });

  const [typeDiscount, setTypeDiscount] = useState<TypeDiscount | null>(null);

  const handleConfirmModal = (id: number) => {
    const list = typeDiscount === "principal" ? primaryDiscountList : secondaryDiscountList;
    const completeOptionSelected = list?.find((d) => d.id === id);
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
        typeDiscount === "principal" ? optionsPrimaryDiscounts : optionsSecondaryDiscounts,
        primaryDiscountsFields,
        secondaryDiscountsFields
      ),
    [
      typeDiscount,
      optionsPrimaryDiscounts,
      optionsSecondaryDiscounts,
      primaryDiscountsFields,
      secondaryDiscountsFields
    ]
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
          <Title level={4}>{t("form.description")}</Title>
          <Flex gap={20}>
            <InputForm
              control={control}
              error={errors.name}
              nameInput="name"
              titleInput={tCommon("fields.name")}
              className={styles.input}
            />
            <InputForm
              control={control}
              error={errors.description}
              nameInput="description"
              titleInput={tCommon("fields.description")}
              className={styles.inputDesc}
            />
          </Flex>
          <Title level={4}>{t("form.dates")}</Title>
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
                  <Text type="secondary">{t("form.noEndDate")}</Text>
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
                      <Text type="secondary">{t("form.start")}</Text>
                      <DatePicker
                        className={styles.inputDatePicker}
                        placeholder={t("form.start")}
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
                      <Text type="secondary">{t("form.end")}</Text>
                      <DatePicker
                        disabled={watch("is_active")}
                        className={styles.inputDatePicker}
                        placeholder={t("form.end")}
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
              <Title level={4}>{t("package.discount")}</Title>
              <Title level={5}>{t("byClient.selectCustomerGroup")}</Title>
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
                  columns={discountsFormColumns({
                    remove: removeDiscount,
                    isFormDisabled,
                    t: tColumns,
                    tCommon
                  })}
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
                    {t("package.addRule")}
                  </PrincipalButton>
                </Flex>
              )}
            </Flex>
            <Flex vertical gap={24}>
              <Title level={4}>{t("package.additionalDiscount")}</Title>
              <Table
                dataSource={secondaryDiscountsFields}
                columns={discountsFormColumns({
                  remove: removeAdditionalDiscount,
                  isFormDisabled,
                  t: tColumns,
                  tCommon
                })}
                pagination={false}
              />
              {!isFormDisabled && secondaryDiscountsFields.length === 0 && (
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
                    {t("package.addRule")}
                  </PrincipalButton>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Flex>
        <Flex gap={20} justify="space-between">
          <Link href={listPath} passHref legacyBehavior>
            <Button
              style={{ height: "100%", backgroundColor: "#d3d3d3" }}
              className={styles.buttonEdit}
            >
              {t("form.backToList")}
            </Button>
          </Link>
          {statusForm !== "review" && (
            <PrincipalButton
              className={styles.button}
              onClick={handleExecCallback}
              loading={loading}
            >
              {t("package.create")}
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
