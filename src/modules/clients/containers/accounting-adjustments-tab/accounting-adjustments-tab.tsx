import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Flex, Spin } from "antd";
import { CaretDoubleRight, DotsThree } from "phosphor-react";
import { AxiosError } from "axios";
import { mutate } from "swr";

import { addItemsToTable } from "@/services/applyTabClients/applyTabClients";
import { extractSingleParam } from "@/utils/utils";
import { useMessageApi } from "@/context/MessageContext";
import { useModalDetail } from "@/context/ModalContext";
import { useApplicationTable } from "@/hooks/useApplicationTable";
import { useFinancialDiscounts } from "@/hooks/useFinancialDiscounts";
import { useDebounce } from "@/hooks/useDeabouce";

import LabelCollapse from "@/components/ui/label-collapse";
import UiSearchInput from "@/components/ui/search-input";
import AccountingAdjustmentsTable from "@/modules/clients/components/accounting-adjustments-table";
import Collapse from "@/components/ui/collapse";
import AccountingAdjustmentsFilter, {
  SelectedFiltersAccountingAdjustments
} from "@/components/atoms/Filters/FilterAccountingAdjustmentTab/FilterAccountingAdjustmentTab";
import { ModalActionAccountingAdjustments } from "@/components/molecules/modals/ModalActionAccountingAdjustments/ModalActionAccountingAdjustments";

import {
  FinancialDiscount,
  StatusFinancialDiscounts
} from "@/types/financialDiscounts/IFinancialDiscounts";

import "./accounting-adjustments-tab.scss";

const AccountingAdjustmentsTab = () => {
  const [selectedRows, setSelectedRows] = useState<FinancialDiscount[] | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [isModalActionPaymentOpen, setIsModalActionPaymentOpen] = useState(false);

  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const projectIdParam = extractSingleParam(params.projectId);
  const clientId = clientIdParam || "";
  const projectId = projectIdParam ? parseInt(projectIdParam) : 0;
  const debouncedSearchQuery = useDebounce(search, 500);
  const [filters, setFilters] = useState<SelectedFiltersAccountingAdjustments>({
    lines: [],
    zones: [],
    channels: []
  });
  const JustOthersMotiveType = 2; // no trae ajustes financieros
  const { data, isLoading } = useFinancialDiscounts({
    clientId,
    projectId,
    id: debouncedSearchQuery ? parseInt(debouncedSearchQuery) : undefined,
    line: filters.lines,
    zone: filters.zones,
    channel: filters.channels,
    motive_id: JustOthersMotiveType
  });

  const { mutate: mutateApplyTabData } = useApplicationTable();

  // useMemo to add the key financial_status_id to each row in the data
  const modifiedData = useMemo(() => {
    return data?.map((financialState: StatusFinancialDiscounts) => {
      return {
        ...financialState,
        financial_discounts: financialState.financial_discounts.map((adjustment) => ({
          ...adjustment,
          financial_status_id: financialState.status_id
        }))
      };
    });
  }, [data]);

  const { openModal, modalType } = useModalDetail();
  const { showMessage } = useMessageApi();

  const handleOpenAdjustmentDetail = (adjustment: FinancialDiscount) => {
    openModal("adjustment", {
      selectAdjusment: adjustment,
      clientId,
      projectId,
      legalized: adjustment.legalized
    });
  };

  useEffect(() => {
    mutate(`/financial-discount/project/${projectId}/client/${clientId}`);
  }, [modalType]);

  const handleAddSelectedAdjustmentsToApplicationTable = async () => {
    try {
      await addItemsToTable(
        Number(projectId) || 0,
        clientId,
        "discounts",
        selectedRows?.map((adjustment) => adjustment.id) || []
      );
      setIsModalActionPaymentOpen(false);
      showMessage("success", "Ajuste(s) añadidos a la tabla de aplicación de pagos");
      // mutate Applytable data
      mutateApplyTabData();
    } catch (error) {
      if (error instanceof AxiosError) {
        showMessage(
          "error",
          `Error al añadir ajuste(s) a la tabla de aplicación de pagos ${error.message}`
        );
      } else {
        showMessage("error", `Error al añadir ajuste(s) a la tabla de aplicación de pagos`);
      }
    }
  };

  const handleOpenBalanceLegalization = () => {
    setIsModalActionPaymentOpen(false);
    openModal("balanceLegalization", {
      financialDiscounts: selectedRows
    });
  };

  return (
    <>
      <div className="accountingAdjustmentsTab">
        <Flex
          justify="space-between"
          className="accountingAdjustmentsTab__header clientStickyHeader"
        >
          <Flex gap={"0.5rem"}>
            <UiSearchInput
              className="search"
              placeholder="Buscar"
              onChange={(event) => {
                setSearch(event.target.value);
              }}
            />
            <AccountingAdjustmentsFilter onFilterChange={setFilters} />
            <Button
              className="button__actions"
              size="large"
              icon={<DotsThree size={"1.5rem"} />}
              disabled={false}
              onClick={() => setIsModalActionPaymentOpen(true)}
            >
              Generar acción
            </Button>
          </Flex>
          <Button
            type="primary"
            className="availableAdjustments"
            onClick={() => console.log("click ajustes disponibles")}
          >
            Ajustes disponibles
            <CaretDoubleRight size={16} style={{ marginLeft: "0.5rem" }} />
          </Button>
        </Flex>

        {isLoading ? (
          <Flex justify="center" align="center" style={{ height: "3rem" }}>
            <Spin />
          </Flex>
        ) : (
          <Collapse
            stickyLabel
            items={modifiedData?.map((financialState: StatusFinancialDiscounts) => ({
              key: financialState.status_id,
              label: (
                <LabelCollapse
                  status={financialState.status_name}
                  color={financialState.color}
                  total={financialState.total}
                  quantity={financialState.count}
                />
              ),
              children: (
                <>
                  <AccountingAdjustmentsTable
                    dataAdjustmentsByStatus={financialState.financial_discounts}
                    setSelectedRows={setSelectedRows}
                    openAdjustmentDetail={handleOpenAdjustmentDetail}
                    financialStatusId={financialState.status_id}
                    legalized={financialState.legalized}
                    selectedRows={selectedRows}
                  />
                </>
              )
            }))}
          />
        )}

        <ModalActionAccountingAdjustments
          isOpen={isModalActionPaymentOpen}
          onClose={() => setIsModalActionPaymentOpen(false)}
          addAdjustmentsToApplicationTable={handleAddSelectedAdjustmentsToApplicationTable}
          balanceLegalization={handleOpenBalanceLegalization}
        />
      </div>
    </>
  );
};

export default AccountingAdjustmentsTab;
