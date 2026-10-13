import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Flex, Modal, Pagination, Spin } from "antd";
import { CaretLeft, Plus } from "phosphor-react";

import { IFinancialDiscount } from "@/hooks/useAcountingAdjustment";
import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import { extractSingleParam, formatDate } from "@/utils/utils";
import {
  getApplicationAdjustments,
  getApplicationBalances
} from "@/services/applyTabClients/applyTabClients";

import UiSearchInputLong from "@/components/ui/search-input-long";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import CheckboxColoredValues from "@/components/ui/checkbox-colored-values/checkbox-colored-values";
import ModalApplySpecificAdjustment from "../ModalApplySpecificAdjustment/ModalApplySpecificAdjustment";

import { IAddingType, IModalAdjustmentsState } from "../../apply-tab";
import { IApplyTabRecord, IApplicationBalance } from "@/types/applyTabClients/IApplyTabClients";

import "./modalListAdjustments.scss";

interface ModalListAdjustmentsProps {
  visible: boolean;
  // eslint-disable-next-line no-unused-vars
  onCancel: (actionAplied?: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  setModalAction: (modalAction: number) => void;
  addGlobalAdjustment: (
    // eslint-disable-next-line no-unused-vars
    adding_type: IAddingType,
    // eslint-disable-next-line no-unused-vars
    selectedIds: number[]
  ) => Promise<void>;
  modalAdjustmentsState: IModalAdjustmentsState;
  selectedInvoices?: IApplyTabRecord[];
}

const ModalListAdjustments: React.FC<ModalListAdjustmentsProps> = ({
  visible,
  onCancel,
  setModalAction,
  addGlobalAdjustment,
  modalAdjustmentsState,
  selectedInvoices
}) => {
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { showMessage } = useMessageApi();
  const [adjustments, setAdjustments] = useState<(IFinancialDiscount | IApplicationBalance)[]>();
  const [selectedRows, setSelectedRows] = useState<(IFinancialDiscount | IApplicationBalance)[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  const [isApplyingSpecificAdjustment, setIsApplyingSpecificAdjustment] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let ignore = false;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        if (modalAdjustmentsState.adjustmentType === "global") {
          const response = await getApplicationBalances(projectId, clientId);
          if (!ignore) setAdjustments(response?.flatMap((group) => group.balances) ?? []);
        } else {
          const response = await getApplicationAdjustments(projectId, clientId);
          if (!ignore) setAdjustments(response.map((item) => item.financial_discounts).flat());
        }
      } catch (error) {
        console.error("error fetchData", error);
      } finally {
        if (!ignore) setLoadingData(false);
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [projectId, clientId, visible, modalAdjustmentsState.adjustmentType]);

  useEffect(() => {
    return () => {
      setSelectedRows([]);
      setSearchQuery("");
      setCurrentPage(1);
    };
  }, [visible]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleCreateAdjustments = () => {
    if (modalAdjustmentsState.adjustmentType === "global") {
      setModalAction(3);
    } else if (modalAdjustmentsState.adjustmentType === "byInvoice") {
      setModalAction(4);
    }
  };

  const handleSelectOne = (checked: boolean, row: IFinancialDiscount | IApplicationBalance) => {
    setSelectedRows((prevSelectedRows) =>
      checked
        ? [...prevSelectedRows, row]
        : prevSelectedRows.filter((selected) => selected.id !== row.id)
    );
  };

  const handleAddAdjustments = async () => {
    setLoading(true);
    if (modalAdjustmentsState.adjustmentType === "global") {
      await addGlobalAdjustment(
        "balances",
        selectedRows.map((row) => row.id)
      );
    } else if (modalAdjustmentsState.adjustmentType === "byInvoice") {
      // rectify there are invoices selected
      if (!selectedInvoices?.length || !selectedInvoices[0].id_erp) {
        showMessage("error", "No hay facturas seleccionadas");
        setLoading(false);
        return;
      }

      setIsApplyingSpecificAdjustment(true);
    }
    setLoading(false);
  };

  const filteredData = useMemo(() => {
    if (!adjustments) return [];
    return adjustments.filter((row) => {
      const query = searchQuery.toLowerCase();

      if (modalAdjustmentsState.adjustmentType === "global") {
        return (row as IApplicationBalance).id.toString().toLowerCase().includes(query);
      }

      const discountRow = row as IFinancialDiscount;
      const matchesErpId = discountRow.erp_id?.toString().toLowerCase().includes(query);
      const matchesComment = discountRow.comments?.toLowerCase().includes(query);

      return matchesErpId || matchesComment;
    });
  }, [adjustments, searchQuery, modalAdjustmentsState.adjustmentType]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData?.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      {!isApplyingSpecificAdjustment ? (
        <Modal
          open={visible}
          onCancel={() => onCancel()}
          footer={null}
          width={700}
          className="modal-list-adjustments"
        >
          <div onClick={() => onCancel()} className="header">
            <CaretLeft size={24} />
            <h2>Agregar ajuste</h2>
          </div>
          <h2 className="modal-subtitle">Selecciona los ajustes a aplicar</h2>
          <div className="search-container">
            <UiSearchInputLong
              placeholder="Buscar"
              className={"custom-input"}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          {loadingData ? (
            <Flex justify="center" style={{ width: "100%", margin: "2rem 0" }}>
              <Spin />
            </Flex>
          ) : (
            <>
              <div className="adjustments-list">
                {paginatedRows?.map((row) => {
                  const isGlobal = modalAdjustmentsState.adjustmentType === "global";
                  const title = isGlobal
                    ? row.comments
                    : `Nota crédito ${(row as IFinancialDiscount).erp_id}`;
                  const subtitle = isGlobal
                    ? formatDate((row as IApplicationBalance).created_at)
                    : (row as IFinancialDiscount).comments;
                  return (
                    <CheckboxColoredValues
                      customStyles={{ height: "76px" }}
                      customStyleDivider={{ width: "6px", height: "44px", alignSelf: "center" }}
                      key={row.id}
                      onChangeCheckbox={(e) => {
                        handleSelectOne(e.target.checked, row);
                      }}
                      checked={selectedRows.some((selected) => selected.id === row.id)}
                      content={
                        <Flex style={{ width: "100%" }} justify="space-between" align="center">
                          <Flex vertical>
                            <h4 className="adjustments-list__title">{title}</h4>
                            {subtitle && <p className="adjustments-list__subtitle">{subtitle}</p>}
                          </Flex>

                          <Flex vertical>
                            <h3 className="adjustments-list__amount">
                              {formatMoney(row.current_value)}
                            </h3>
                            <p className="adjustments-list__subvalue">
                              {formatMoney(row.initial_value)}
                            </p>
                          </Flex>
                        </Flex>
                      }
                    />
                  );
                })}
              </div>
              <Pagination
                pageSize={ITEMS_PER_PAGE}
                current={currentPage}
                onChange={handlePageChange}
                total={filteredData?.length}
                showSizeChanger={false}
                style={{ textAlign: "right", margin: ".5rem 0" }}
              />
            </>
          )}
          <div className="create-adjustment">
            <button onClick={handleCreateAdjustments} className="create-adjustment-btn">
              <Plus size={20} />
              Crear ajuste
            </button>
          </div>

          <div className="modal-footer">
            <SecondaryButton fullWidth onClick={() => onCancel()}>
              Cancelar
            </SecondaryButton>
            <PrincipalButton
              fullWidth
              onClick={handleAddAdjustments}
              loading={loading}
              disabled={!selectedRows.length}
            >
              Agregar
            </PrincipalButton>
          </div>
        </Modal>
      ) : (
        <ModalApplySpecificAdjustment
          open={isApplyingSpecificAdjustment}
          onCancel={(succesfullyApplied?: boolean) => {
            setIsApplyingSpecificAdjustment(false);
            if (succesfullyApplied) {
              onCancel(true);
            }
          }}
          selectedAdjustments={selectedRows as IFinancialDiscount[]}
          selectedInvoices={selectedInvoices}
        />
      )}
    </>
  );
};

export default ModalListAdjustments;
