"use client";
import { Collapse, Flex, Modal, Typography } from "antd";

import {
  ArrowsClockwise,
  Calculator,
  Handshake,
  NewspaperClipping,
  LinkBreak,
  CaretRight,
  WarningDiamond,
  HandTap,
  PaperPlaneTilt,
  Paperclip
} from "@phosphor-icons/react";

import "./modalgenerateaction.scss";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  setShowActionDetailModal: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      actionType: number;
    }>
  >;
  validateInvoiceIsSelected: () => boolean;
  setSelectOpen: Dispatch<SetStateAction<{ selected: number }>>;
  addInvoicesToApplicationTable: () => void;
}

export const ModalGenerateAction = ({
  isOpen,
  onClose,
  clientId,
  validateInvoiceIsSelected,
  setShowActionDetailModal,
  setSelectOpen,
  addInvoicesToApplicationTable
}: Props) => {
  const router = useRouter();
  const handleActionDetail = (type: number) => {
    if (validateInvoiceIsSelected()) {
      setShowActionDetailModal({ isOpen: true, actionType: type });
    }
  };

  const handleOpenModal = (type: number) => {
    if (validateInvoiceIsSelected()) {
      setSelectOpen({
        selected: type
      });
    }
  };
  return (
    <Modal
      className="modalGenerateAction"
      width={"40%"}
      open={isOpen}
      centered
      title={
        <Title className="modalGenerateAction__title" level={4}>
          Generar acción
        </Title>
      }
      footer={null}
      onCancel={onClose}
    >
      <p className="modalGenerateAction__description">Selecciona la acción que vas a realizar</p>
      <Flex vertical gap="0.75rem">
        <Collapse
          className="collapseByAction"
          expandIconPosition="end"
          ghost
          accordion
          items={actionsOptions(handleActionDetail)}
        />
        <ButtonGenerateAction
          onClick={() => {
            handleOpenModal(6);
          }}
          icon={<Handshake size={16} />}
          title="Acuerdo de pago"
        />
        <ButtonGenerateAction
          icon={<WarningDiamond size={16} />}
          title="Registrar novedad"
          onClick={() => {
            handleOpenModal(1);
          }}
        />
        <ButtonGenerateAction
          icon={<ArrowsClockwise size={16} />}
          title="Cambio de estado"
          onClick={() => {
            handleOpenModal(2);
          }}
        />
        <ButtonGenerateAction
          icon={<NewspaperClipping size={16} />}
          title="Radicar factura"
          onClick={() => {
            handleOpenModal(3);
          }}
        />
        <ButtonGenerateAction
          icon={<HandTap size={16} />}
          title="Aplicar pagos"
          onClick={() => {
            console.log("Aplicar pagos");
            addInvoicesToApplicationTable();
          }}
        />
        <ButtonGenerateAction
          icon={<Paperclip size={16} />}
          title="Vincular orden de compra"
          onClick={() => {
            handleOpenModal(5);
          }}
        />
        <ButtonGenerateAction
          icon={<LinkBreak size={16} />}
          title="Concilación masiva"
          onClick={() => {
            router.push(`/conciliacion/${clientId}`);
          }}
        />
        <ButtonGenerateAction
          icon={<PaperPlaneTilt size={16} />}
          title="Acta digital"
          onClick={() => {
            setSelectOpen({
              selected: 7
            });
          }}
        />
      </Flex>
    </Modal>
  );
};

const actionsOptions = (handleActionDetail: (_number: number) => void) => [
  {
    key: 1,
    label: (
      <div className="collapseByAction__label">
        <Calculator size={16} />
        <Title className="collapseByAction__label__text" level={4}>
          Ajustes Contables
        </Title>
      </div>
    ),
    children: (
      <div className="collapseByAction__children">
        <Flex
          className="collapseByAction__children__item"
          justify="space-between"
          onClick={() => handleActionDetail(2)}
        >
          <Text>Generar nota crédito</Text>
          <CaretRight size={16} />
        </Flex>
        <hr />
        <Flex
          className="collapseByAction__children__item"
          justify="space-between"
          onClick={() => handleActionDetail(3)}
        >
          <Text>Generar descuento</Text>
          <CaretRight size={16} />
        </Flex>
        <hr />
        <Flex
          className="collapseByAction__children__item"
          justify="space-between"
          onClick={() => handleActionDetail(1)}
        >
          <Text>Generar nota débito</Text>
          <CaretRight size={16} />
        </Flex>
      </div>
    )
  }
];
