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
  const [selectedRows, setSelectedRows] = useState<FinancialDiscount[] | undefined>();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState({
    selected: 0
  });

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
      setIsModalOpen({ selected: 0 });
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
    setIsModalOpen({ selected: 0 });
    openModal("balanceLegalization", {
      selectedAdjustments: mockFinancialDiscounts
    });
  };

  const handleOpenModal = (selected: number) => {
    setIsModalOpen({ selected });
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
              onClick={() => setIsModalOpen({ selected: 1 })} // Open modal for actions
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
          isOpen={isModalOpen.selected === 1}
          onClose={() => setIsModalOpen({ selected: 0 })}
          addAdjustmentsToApplicationTable={handleAddSelectedAdjustmentsToApplicationTable}
          balanceLegalization={handleOpenBalanceLegalization}
          handleOpenModal={handleOpenModal}
          selectedRows={selectedRows}
        />
      </div>
    </>
  );
};

export default AccountingAdjustmentsTab;

const mockFinancialDiscounts = [
  {
    id: 1,
    sucursal_id: 101,
    line_id: 2001,
    sub_line_id: 3001,
    project_id: 10,
    dependecy_sucursal: 101,
    initial_value: 100000,
    current_value: 80000,
    expiration_date: "2025-12-31T00:00:00Z",
    comments: "First discount applied",
    files: null,
    create_at: "2025-01-01T10:00:00Z",
    update_at: "2025-05-01T12:00:00Z",
    delete_at: null,
    status_id: 1,
    document_type_id: 2,
    client_id: "C123456789",
    percentage: 20,
    is_discount: 1,
    date_of_issue: "2025-01-01T00:00:00Z",
    erp_id: 5001,
    motive_id: 301,
    validity_range: "2025-01-01 to 2025-12-31",
    earlypay_date: null,
    is_legalized: 1,
    is_deleted: 0,
    status_name: "Approved",
    project_name: "Project Alpha",
    document_type_name: "Factura",
    motive_name: "Descuento por pronto pago",
    financial_status_id: 100,
    legalized: true,
    cp_id: "CP001"
  },
  {
    id: 2,
    sucursal_id: 102,
    line_id: 2002,
    sub_line_id: 3002,
    project_id: 11,
    dependecy_sucursal: 102,
    initial_value: 200000,
    current_value: 150000,
    expiration_date: "2025-11-30T00:00:00Z",
    comments: "Seasonal adjustment",
    files: null,
    create_at: "2025-02-15T09:30:00Z",
    update_at: "2025-05-15T14:00:00Z",
    delete_at: null,
    status_id: 2,
    document_type_id: 3,
    client_id: "C987654321",
    percentage: null,
    is_discount: 0,
    date_of_issue: "2025-02-10T00:00:00Z",
    erp_id: 5002,
    motive_id: 302,
    validity_range: null,
    earlypay_date: "2025-06-01T00:00:00Z",
    is_legalized: 0,
    is_deleted: 0,
    status_name: "Pending",
    project_name: "Project Beta",
    document_type_name: "Nota Crédito",
    motive_name: "Ajuste por volumen",
    financial_status_id: 101,
    legalized: false,
    cp_id: "CP002"
  }
];
