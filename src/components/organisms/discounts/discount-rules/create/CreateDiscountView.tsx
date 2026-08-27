"use client";
import styles from "./CreateDiscountView.module.scss";
import { Button, Flex } from "antd";
import HeaderDiscountType from "./components/headerDiscountType/HeaderDiscountType";
import DefinitionDiscounts from "./components/definitionsDiscount/DefinitionDiscounts";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import useCreateDiscountView from "./hooks/useCreateDiscountView";
import AnnualDiscountDefinition from "./components/annualDiscountDefinition/AnnualDiscountDefinition";
import discountCategories from "../../constants/discountTypes";
import Link from "next/link";

const commonDiscount = [discountCategories.byOrder.id, discountCategories.byClient.id];
const annualDiscount = [discountCategories.annual.id];

type Props = {
  params?: { id?: string; basePath?: string; listPath?: string };
};

export function CreateDiscountView({ params }: Props) {
  const {
    discountId,
    selectedType,
    handleClick,
    form,
    handleExecCallback,
    loading,
    statusForm,
    setFiles,
    handleChangeStatusForm,
    contextHolder,
    handleUpdateContract,
    listPath
  } = useCreateDiscountView({ params });

  return (
    <>
      {contextHolder}
      <Flex className={styles.mainCreateDiscount}>
        <HeaderDiscountType
          selectedType={selectedType}
          handleClick={handleClick}
          discountId={discountId}
        />
        {commonDiscount.includes(selectedType) && (
          <DefinitionDiscounts
            form={form}
            selectedType={selectedType}
            discountId={discountId}
            statusForm={statusForm}
            handleChangeStatusForm={handleChangeStatusForm}
            loadingMain={loading}
          />
        )}
        {annualDiscount.includes(selectedType) && (
          <AnnualDiscountDefinition
            form={form}
            selectedType={selectedType}
            setFiles={setFiles}
            statusForm={statusForm}
            handleChangeStatusForm={handleChangeStatusForm}
            loadingMain={loading}
            handleUpdateContract={handleUpdateContract}
          />
        )}
        <Flex gap={20} justify="space-between">
          <Link href={listPath} passHref legacyBehavior>
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
              {discountId ? "Guardar Descuento" : "Crear Descuento"}
            </PrincipalButton>
          )}
        </Flex>
      </Flex>
    </>
  );
}
