import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Modal, Table, InputNumber } from "antd";
import { ColumnsType } from "antd/es/table";
import { CaretLeft, CopySimple } from "phosphor-react";

import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import { IFinancialDiscount } from "@/hooks/useAcountingAdjustment";
import { extractSingleParam } from "@/utils/utils";
import { addSpecificAdjustments } from "@/services/applyTabClients/applyTabClients";

import UiTabs from "@/components/ui/ui-tabs";
import ItemApplyModal from "@/components/atoms/ItemsApplyModal/ItemsApplyModal";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";

import { IApplyTabRecord } from "@/types/applyTabClients/IApplyTabClients";

import "./modalApplySpecificAdjustment.scss";

interface Props {
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  onCancel: (succesfullyApplied?: boolean) => void;
  selectedAdjustments: IFinancialDiscount[];
  selectedInvoices?: IApplyTabRecord[];
}

interface ICurrentInvoice {
  id: number;
  id_erp?: string;
  current_value: number;
  new_balance: number;
}

const ModalApplySpecificAdjustment = ({
  open,
  onCancel,
  selectedAdjustments,
  selectedInvoices
}: Props) => {
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { showMessage } = useMessageApi();
  const [selectTab, setSelectTab] = useState(0);
  const [currentInvoices, setCurrentInvoices] = useState<ICurrentInvoice[]>(
    selectedInvoices?.map((invoice) => ({
      id: invoice.financial_record_id ?? 0,
      id_erp: invoice.id_erp,
      current_value: invoice.current_value,
      new_balance: invoice.current_value
    })) ?? []
  );

  const [currentAdjustment, setCurrentAdjustment] = useState<number[]>(
    selectedAdjustments.map((note) => note.current_value)
  );
  const [applyValues, setApplyValues] = useState<{
    [key: string]: {
      balanceToApply: number;
      idAdjustment: number;
      id_erp: string;
    }[];
  }>({});
  const [loadingRequest, setLoadingRequest] = useState(false);

  const handleValueChange = (valueApplied: number, index: number, record: ICurrentInvoice) => {
    setCurrentAdjustment((prev) => {
      const previousValue =
        applyValues[record.id]?.find(
          (apply) => apply.idAdjustment === selectedAdjustments[index].id
        )?.balanceToApply ?? 0;

      // set the new value to the current adjustment
      let newValue = prev[index];
      if (valueApplied > previousValue) {
        // If the new value is greater than the previous value, decrease the adjustment
        newValue = prev[index] - (valueApplied - previousValue);
      } else if (valueApplied < previousValue) {
        // If the new value is less, increase the adjustment
        newValue = prev[index] + (previousValue - valueApplied);
      }

      // Ensure the new value doesn't go below zero
      newValue = Math.max(0, newValue);

      return prev.map((value, i) => (i === index ? newValue : value));
    });
  };

  const handleApplyValueChange = (value: number | null, record: ICurrentInvoice) => {
    const previousValue =
      applyValues[record.id]?.find(
        (apply) => apply.idAdjustment === selectedAdjustments[selectTab].id
      )?.balanceToApply ?? 0;

    if (value && value > currentAdjustment[selectTab] && previousValue <= 0) {
      value = 0;
    }
    if (value && value > selectedAdjustments[selectTab].current_value) {
      value = 0;
    }
    if (value && value > previousValue && value > currentAdjustment[selectTab] + previousValue) {
      value = previousValue;
    }
    const maxApplicableValue = Math.min(value ?? 0, record.new_balance + previousValue);

    setApplyValues((prev) => ({
      ...prev,
      [record.id]: [
        ...(prev[record.id] ?? []).filter(
          (apply) => apply.idAdjustment !== selectedAdjustments[selectTab].id
        ),
        {
          balanceToApply: maxApplicableValue,
          idAdjustment: selectedAdjustments[selectTab].id,
          id_erp: record.id_erp
        }
      ]
    }));

    setCurrentInvoices((prev) => {
      return prev.map((invoice) => {
        if (invoice.id === record.id) {
          const difference = maxApplicableValue - previousValue;
          return {
            ...invoice,
            new_balance: invoice.new_balance - difference
          };
        }
        return invoice;
      });
    });
    handleValueChange(value ?? 0, selectTab, record);
  };

  const handleApplyAdjustment = async () => {
    setLoadingRequest(true);
    try {
      await addSpecificAdjustments(projectId, clientId, {
        adjustment_data: currentInvoices.map((invoice) => ({
          invoice_id: invoice.id,
          discounts: applyValues[invoice.id]?.map((apply) => ({
            id: apply.idAdjustment,
            balanceToApply: apply.balanceToApply
          }))
        })),
        type: 11
      });

      showMessage("success", "Ajuste aplicado correctamente");
      onCancel(true);
    } catch (error) {
      showMessage("error", "Error al aplicar el ajuste");
    }
    setLoadingRequest(false);
  };

  const handlePasteInvoices = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split("\n");

      // create an array of objects with the values of the excel
      const objectRows = rows.map((row) => {
        const columns = row.split("\t");
        return {
          id_erp: columns[0],
          applied_amount: columns[1]
        };
      });

      objectRows.forEach((row) => {
        const invoice = currentInvoices.find((invoice) => invoice.id_erp === row.id_erp);
        if (!invoice) return;

        const applyValue = parseFloat(row.applied_amount.replace(/\./g, ""));

        if (isNaN(applyValue)) return;

        handleApplyValueChange(applyValue, invoice);
      });
    } catch (err) {
      console.error("Error pasting invoices:", err);
    }
  };

  const columns: ColumnsType<ICurrentInvoice> = [
    {
      title: "ID Factura",
      dataIndex: "id_erp",
      key: "id_erp",
      render: (id_erp) => <p className="sectionContainerTable__id">{id_erp}</p>
    },
    {
      title: "Pendiente",
      dataIndex: "current_value",
      key: "current_value",
      align: "right",
      render: (val) => `${formatMoney(val)}`
    },
    {
      title: "Saldo nuevo",
      dataIndex: "new_balance",
      key: "new_balance",
      align: "right",
      render: (val) => `${formatMoney(val)}`
    },
    {
      title: "Valor a aplicar",
      key: "applyValue",
      className: "column__apply__value",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={selectedAdjustments[selectTab]?.current_value + 1}
          value={
            applyValues[record.id]?.find(
              (apply) => apply.idAdjustment === selectedAdjustments[selectTab]?.id
            )?.balanceToApply
          }
          formatter={(value) => {
            if (!value) return ""; // Prevent formatting null/undefined values
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Format properly for thousands separators
          }}
          parser={(value) => Number(value?.replace(/\./g, "") || 0)}
          onBlur={(event) => {
            const rawValue = event.target.value.replace(/\./g, "");
            const parsedValue = parseFloat(rawValue);
            handleApplyValueChange(isNaN(parsedValue) ? 0 : parsedValue, record);
          }}
          className="button__number__adjustment"
          placeholder="Ingresar valor"
          style={{ textAlign: "right" }}
        />
      )
    }
  ];

  return (
    <Modal
      className="modalApplySpecificAdjustment"
      width={680}
      open={open}
      onCancel={() => onCancel()}
      footer={null}
    >
      <div onClick={() => onCancel()} className="header">
        <CaretLeft size={24} onClick={() => onCancel()} />
        <h2>Aplicar ajuste</h2>
      </div>
      <h2 className="modal-subtitle">Define el monto a aplicar a cada factura</h2>
      {selectedAdjustments.length > 1 && (
        <UiTabs
          tabs={selectedAdjustments.map((row) => row.id.toString())}
          onTabClick={(index) => setSelectTab(index)}
          initialTabIndex={selectTab}
          className="scrollableTabs"
        />
      )}
      <ItemApplyModal
        type={1}
        item={
          selectedAdjustments.length > 1
            ? {
                ...selectedAdjustments[selectTab],
                intialAmount: selectedAdjustments[selectTab].initial_value
              }
            : { ...selectedAdjustments[0], intialAmount: selectedAdjustments[0].initial_value }
        }
        availableValue={currentAdjustment[selectTab]}
      />

      <div className="excel-button-container" onClick={handlePasteInvoices}>
        <CopySimple size={18} />
        Pegar desde excel
      </div>

      <Table dataSource={currentInvoices} columns={columns} pagination={false} rowKey="id" />

      <div className="modal-footer">
        <SecondaryButton fullWidth onClick={() => onCancel()}>
          Cancelar
        </SecondaryButton>
        <PrincipalButton fullWidth onClick={handleApplyAdjustment} loading={loadingRequest}>
          Agregar
        </PrincipalButton>
      </div>
    </Modal>
  );
};

export default ModalApplySpecificAdjustment;
