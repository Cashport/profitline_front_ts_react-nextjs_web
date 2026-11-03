import { Flex, Modal, Typography } from "antd";
import { NewspaperClipping } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

import { useMessageApi } from "@/context/MessageContext";
import { changeOrderState } from "@/services/commerce/commerce";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import "./modal-order-actions.scss";

const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  onActionSuccess: () => void;
}

export const ModalOrderActions = ({ isOpen, onClose, orderId, onActionSuccess }: Props) => {
  const t = useTranslations("commerce.orderActions");
  const { showMessage } = useMessageApi();

  const handleChangeOrderState = async () => {
    try {
      await changeOrderState([orderId], showMessage);
      onActionSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      className="ordersGenerateActionModal"
      open={isOpen}
      title={
        <Title className="ordersGenerateActionModal__title" level={4}>
          {t("title")}
        </Title>
      }
      footer={null}
      onCancel={onClose}
    >
      <p className="ordersGenerateActionModal__description">{t("description")}</p>
      <Flex vertical gap="0.75rem">
        <ButtonGenerateAction
          onClick={handleChangeOrderState}
          icon={<NewspaperClipping size={16} />}
          title={t("moveToBilled")}
        />
      </Flex>
    </Modal>
  );
};
