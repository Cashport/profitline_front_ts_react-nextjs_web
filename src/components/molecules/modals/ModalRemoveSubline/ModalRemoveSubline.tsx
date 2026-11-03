import { Modal, Typography } from "antd";
import { useTranslations } from "use-intl";
import "./modalremovesubline.scss";

const { Text } = Typography;

interface Props {
  isOpen: boolean;
  isLoading: boolean;
  sublineDescription: string;
  onClose: () => void;
  onRemove?: () => void;
}
export const ModalRemoveSubline = ({
  isOpen,
  isLoading,
  sublineDescription,
  onClose,
  onRemove
}: Props) => {
  const t = useTranslations("modals.removeSubline");
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      okButtonProps={{ className: "acceptButton", loading: isLoading }}
      okText={t("ok")}
      cancelButtonProps={{
        className: "buttonCancel"
      }}
      className="modalChangeStatusChanel"
      title={t("title")}
      onOk={onRemove}
    >
      <Text className="title">{t("subline", { name: sublineDescription })}</Text>
      <br />
      <Text className="title">{t("irreversible")} </Text>
    </Modal>
  );
};
