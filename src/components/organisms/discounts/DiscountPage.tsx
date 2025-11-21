"use client";

import Discounts from "@/components/organisms/discounts/discount-rules/table/DiscountRulesTable";
import { Flex, message, Tabs, TabsProps } from "antd";
import styles from "./DiscountPage.module.scss";
import Link from "next/link";
import ButtonHeader from "@/components/atoms/buttons/buttonHeader/ButtonHeader";
import DiscountPackages from "@/components/organisms/discounts/discount-package/table/DiscountPackageList";
import useDiscount, {
  DiscountBasicsState,
  DiscountPackageState
} from "@/components/organisms/discounts/hooks/useDiscount";
import UiSearchInput from "@/components/ui/search-input";
import FilterDiscounts from "@/components/atoms/Filters/FilterDiscounts/FilterDiscounts";
import DropdownDiscount from "@/components/molecules/dropdown/discount/DropdownDiscount";
import { ModalDeleteDiscount } from "@/components/molecules/modals/modalDeleteDiscount/ModalDeleteDiscount";
import { useState } from "react";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { DiscountPackage } from "@/types/discount/DiscountPackage";
import { DiscountBasics } from "@/types/discount/DiscountBasics";

export type DiscountTabs = "1" | "2";

function DiscountPage() {
  const [messageApi, messageContex] = message.useMessage();
  const [tabActive, setTabActive] = useState<string>("1");

  const {
    data,
    handleChangeSearch,
    handleChangeActive,
    modalDelete,
    page,
    res,
    handleChangePage,
    handleChangeStatus,
    handleDeleteDiscount,
    handleSelectToDelete,
    loading
  } = useDiscount({ messageApi, tabActive });

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Paquete de descuentos",
      children: (
        <DiscountPackages
          data={data as DiscountPackageState[]}
          loading={loading}
          page={page}
          res={res as GenericResponsePage<DiscountPackage[]> | undefined}
          handleChangePage={handleChangePage}
          handleChangeStatus={handleChangeStatus}
          handleSelectToDelete={handleSelectToDelete}
        />
      )
    },
    {
      key: "2",
      label: "Reglas de descuentos",
      children: (
        <Discounts
          data={data as DiscountBasicsState[]}
          loading={loading}
          page={page}
          res={res as GenericResponsePage<DiscountBasics[]> | undefined}
          handleChangePage={handleChangePage}
          handleChangeStatus={handleChangeStatus}
          handleSelectToDelete={handleSelectToDelete}
        />
      )
    }
  ];
  return (
    <>
      {messageContex}
      <Flex className={styles.flexContainer} vertical gap={20}>
        <Flex gap={20} justify="space-between" wrap="wrap">
          <Flex className={styles.header} gap={"10px"}>
            <UiSearchInput placeholder="Buscar" onChange={handleChangeSearch} />
            <FilterDiscounts handleChangeActive={handleChangeActive} />
            <DropdownDiscount
              disableDelete={!data.some((item) => item.checked)}
              handleDeleteDiscount={modalDelete.handleOpen}
            />
          </Flex>
          <Flex vertical style={{ width: "fit-content" }}>
            <Link
              href={`/descuentos/${tabActive === "1" ? "paquete" : "regla"}/create`}
              passHref
              legacyBehavior
            >
              <ButtonHeader>
                {tabActive === "1" ? "Crear paquete de descuentos" : "Crear descuento"}
              </ButtonHeader>
            </Link>
          </Flex>
        </Flex>
        <Flex className="tabsContainer">
          <Tabs
            style={{ width: "100%", height: "100%" }}
            defaultActiveKey="1"
            items={items}
            size="large"
            activeKey={tabActive}
            onChange={(newTab) => setTabActive(newTab)}
          />
        </Flex>
      </Flex>
      <ModalDeleteDiscount
        isOpen={modalDelete.isOpen}
        isLoading={modalDelete.isLoading}
        onClose={modalDelete.handleClose}
        onRemove={modalDelete.removeDiscountAction}
      />
    </>
  );
}

export default DiscountPage;
