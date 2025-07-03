import React, { useEffect, useState } from "react";
import { Button, Modal, Radio } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { CaretLeft } from "phosphor-react";

import { changeStatusInvoice } from "@/services/accountingAdjustment/accountingAdjustment";
import ModalAttachEvidence from "@/components/molecules/modals/ModalEvidence/ModalAttachEvidence";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import { IInvoice } from "@/types/invoices/IInvoices";

import styles from "./wallet-tab-change-status-modal.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  projectId?: number;
  invoiceSelected?: IInvoice[];
  messageShow: MessageInstance;
  onCloseAllModals: () => void;
}

const invoiceStates = ["Conciliada", "Sin conciliar", "Glosado", "Devolucion", "Anulada"];

const WalletTabChangeStatusModal: React.FC<Props> = ({
  isOpen,
  onClose,
  invoiceSelected,
  clientId,
  projectId,
  messageShow,
  onCloseAllModals
}) => {
  const [selectedState, setSelectedState] = useState<string | undefined>();
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string | undefined>();
  const [isSecondView, setIsSecondView] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lógica para resetear estados al cerrar modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedState(undefined);
      setSelectedEvidence([]);
      setCommentary(undefined);
      setIsSecondView(false);
    }
  }, [isOpen]);

  // RadioGroup handler
  const handleOnChangeRadioGroup = (e: any) => {
    setSelectedState(e.target.value);
  };

  // Volver a la vista principal
  const handleGoBackToFirstView = () => {
    setIsSecondView(false);
    setSelectedEvidence([]);
    setCommentary(undefined);
  };

  // Cambio de estado y subida de evidencia
  const handleAttachEvidence = async () => {
    setLoading(true);
    try {
      const response = await changeStatusInvoice(
        selectedState as string,
        invoiceSelected?.map((invoice) => invoice.id) as number[],
        commentary as string,
        selectedEvidence,
        projectId as number,
        clientId as string
      );
      messageShow.open({
        type: "success",
        content: response?.data?.message
          ? response?.data?.message
          : "La factura ha cambiado de estado correctamente."
      });
      onCloseAllModals();
      handleGoBackToFirstView();
    } catch (error) {
      messageShow.open({
        type: "error",
        content: "Ha ocurrido un error al cambiar el estado de la factura"
      });
    }
    setLoading(false);
  };

  // Renderizado de la primera vista (cambio de estado)
  const renderFirstView = () => (
    <>
      <Button onClick={onClose} className={styles.content__header}>
        <CaretLeft size="1.25rem" />
        <span>Cambio de estado</span>
      </Button>
      <div className={styles.content} style={{ height: "90%" }}>
        <p className={styles.content__description}>Selecciona el nuevo estado de la factura</p>

        <div className={styles.content__status}>
          {invoiceStates.map((state) => (
            <Radio.Group
              onChange={handleOnChangeRadioGroup}
              value={selectedState?.toLocaleLowerCase()}
              key={state}
            >
              <Radio className={styles.content__status__item} value={state?.toLocaleLowerCase()}>
                {state}
              </Radio>
            </Radio.Group>
          ))}
        </div>

        <FooterButtons
          handleOk={() => setIsSecondView(true)}
          onClose={onClose}
          titleConfirm="Cambiar de estado"
          isConfirmDisabled={!selectedState}
        />
      </div>
    </>
  );

  const renderSecondView = () => (
    <ModalAttachEvidence
      selectedEvidence={selectedEvidence}
      setSelectedEvidence={setSelectedEvidence}
      handleAttachEvidence={handleAttachEvidence}
      commentary={commentary}
      setCommentary={setCommentary}
      isOpen={true}
      loading={loading}
      handleCancel={handleGoBackToFirstView}
      noModal
    />
  );

  return (
    <Modal className={styles.wrapper} width="50%" open={isOpen} footer={null} closable={false}>
      {isSecondView ? renderSecondView() : renderFirstView()}
    </Modal>
  );
};

export default WalletTabChangeStatusModal;
