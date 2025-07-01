import React, { useEffect, useState } from "react";
import { Button, Modal, Table, TableProps, DatePicker, Input } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { CaretLeft } from "phosphor-react";
import dayjs from "dayjs";

import { formatCurrencyMoney, formatDate } from "@/utils/utils";
import { createPaymentAgreement } from "@/services/accountingAdjustment/accountingAdjustment";

import ModalAttachEvidence from "@/components/molecules/modals/ModalEvidence/ModalAttachEvidence";

import { IInvoice } from "@/types/invoices/IInvoices";

import "./wallet-tab-payment-agreement-modal.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  projectId?: number;
  messageShow: MessageInstance;
  invoiceSelected?: IInvoice[];
  onCloseAllModals: () => void;
}

interface ITableData {
  id: number;
  emission: string;
  pending: number;
  agreedValue: string;
  newDate: string;
  id_erp: string;
  [key: string]: any;
}

const PaymentAgreementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  invoiceSelected,
  clientId,
  projectId,
  messageShow,
  onCloseAllModals
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string>();
  const [isSecondView, setIsSecondView] = useState(false);
  const [tableData, setTableData] = useState<ITableData[]>([]);
  const [globalDate, setGlobalDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAttachEvidence = async () => {
    if (!clientId || !projectId) {
      return;
    }

    setIsSubmitting(true);
    const adjustmentData = tableData.map((row) => ({
      invoice_id: row.id,
      date_agreement: (row.newDate && dayjs(row.newDate).format("DD-MM-YYYY")) || "",
      amount: parseFloat(row.agreedValue),
      comment: commentary || ""
    }));

    try {
      await createPaymentAgreement(
        projectId,
        clientId.toString(),
        adjustmentData,
        selectedEvidence[0] || null
      );
      messageShow.success("Acuerdo de pago creado exitosamente");
      onCloseAllModals();
      setGlobalDate(null);
      setIsSecondView(false);
      setSelectedEvidence([]);
    } catch (error) {
      messageShow.error("Error al crear el acuerdo de pago. Por favor, intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChangeDate = (date: string | null) => {
    setGlobalDate(date);

    if (date) {
      const dateString = date;
      setTableData((prevData) =>
        prevData.map((row) => ({
          ...row,
          newDate: dateString
        }))
      );
    } else {
      setTableData((prevData) =>
        prevData.map((row) => ({
          ...row,
          newDate: ""
        }))
      );
    }
  };

  const handleCellChange = (key: string, index: number, value: string) => {
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[index][key] = value;
      return newData;
    });
  };

  const formatNumber = (value: string): string => {
    if (!value) return "";
    const numStr = value.replace(/\D/g, "");
    return `$ ${numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  const parseNumber = (value: string): number => {
    return parseInt(value.replace(/[^\d]/g, ""), 10) || 0;
  };
  const disabledDate: any = (current: dayjs.Dayjs): boolean => {
    // Can not select days before today and today
    return current && current < dayjs().utc().startOf("day");
  };

  const columns: TableProps<ITableData>["columns"] = [
    {
      title: "ID Factura",
      dataIndex: "id",
      key: "id",
      render: (text, record) => {
        return <span>{record.id_erp}</span>;
      }
    },
    {
      title: "Emisión",
      dataIndex: "emission",
      key: "emission",
      render: (text) => {
        return <span>{formatDate(text)}</span>;
      }
    },
    {
      title: "Pendiente",
      dataIndex: "pending",
      key: "pending",
      render: (text) => {
        return <span>{formatCurrencyMoney(text)}</span>;
      }
    },
    {
      title: "Valor acordado",
      dataIndex: "agreedValue",
      key: "agreedValue",
      render: (text: string, record, index: number) => (
        <Input
          value={formatNumber(text)}
          onChange={(e) => {
            const inputValue = e.target.value;
            const numericValue = parseNumber(inputValue);

            if (numericValue <= record.pending) {
              handleCellChange("agreedValue", index, numericValue.toString());
            } else {
              handleCellChange("agreedValue", index, record.pending.toString());
            }
          }}
          className="number__input"
        />
      ),
      align: "center"
    },
    {
      title: "Nueva fecha",
      dataIndex: "newDate",
      key: "newDate",
      render: (text: string, _, index: number) => (
        <DatePicker
          value={text ? text : null}
          onChange={(date) => handleCellChange("newDate", index, date)}
          className="date__piker_input "
          disabledDate={disabledDate}
        />
      ),
      align: "center"
    }
  ];

  useEffect(() => {
    if (invoiceSelected) {
      setTableData(
        invoiceSelected.map((invoice) => ({
          id: invoice.id,
          emission: invoice.financial_record_date,
          pending: invoice.current_value,
          agreedValue: invoice.current_value.toString(), // Inicializar con el valor pendiente
          id_erp: invoice.id_erp,
          newDate: ""
        }))
      );
    }
  }, [invoiceSelected]);

  const onClenModal = () => {
    setGlobalDate(null);
    setIsSecondView(false);
    setSelectedEvidence([]);
    onClose();
  };

  return (
    <Modal
      className="wrapper_payment"
      width={"50%"}
      open={isOpen}
      onCancel={onClenModal}
      footer={null}
    >
      {!isSecondView ? (
        <>
          <div className="content_payment">
            <Button onClick={onClenModal} className="content_payment__header">
              <CaretLeft size={"1.25rem"} />
              <h4>Acuerdo de pago</h4>
            </Button>

            <p className="content_payment__description">
              Selecciona la fecha y el valor para definir el acuerdo de pago
            </p>
            <div>
              <DatePicker
                value={globalDate}
                placeholder="Selecciona la fecha"
                onChange={onChangeDate}
                className="date-input"
                disabledDate={disabledDate}
              />
            </div>

            <Table
              className="selectedInvoicesTable"
              columns={columns}
              dataSource={tableData}
              pagination={false}
            />
          </div>
          <div className="footer">
            <Button className="cancelButton" onClick={onClenModal}>
              Cancelar
            </Button>
            <Button
              className="acceptButton"
              disabled={globalDate === null}
              onClick={() => setIsSecondView(true)}
            >
              Guardar cambios
            </Button>
          </div>
        </>
      ) : (
        <ModalAttachEvidence
          selectedEvidence={selectedEvidence}
          setSelectedEvidence={setSelectedEvidence}
          handleAttachEvidence={handleAttachEvidence}
          commentary={commentary}
          setCommentary={setCommentary}
          isOpen={true}
          loading={isSubmitting}
          handleCancel={() => setIsSecondView(false)}
          noModal
          multipleFiles
        />
      )}
    </Modal>
  );
};

export default PaymentAgreementModal;
