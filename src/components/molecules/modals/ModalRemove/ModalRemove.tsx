import { Modal, Typography } from "antd";
import { useTranslations } from "use-intl";
import "./modalRemove.scss";

const { Text } = Typography;

interface Props {
  isOpen: boolean;
  name?: string;
  isMassiveAction?: boolean;
  onClose: () => void;
  onRemove?: () => void;
}
export const ModalRemove = ({ isOpen, name, onClose, onRemove, isMassiveAction }: Props) => {
  const t = useTranslations("modals.remove");
  const tCommon = useTranslations("common");
  return (
    <Modal
      className="modalRemove"
      width={"60%"}
      open={isOpen}
      onCancel={onClose}
      cancelText={tCommon("actions.cancel")}
      okButtonProps={{ className: "acceptButton" }}
      okText={tCommon("actions.accept")}
      cancelButtonProps={{
        className: "cancelButton"
      }}
      title={t(isMassiveAction ? "titleMany" : "titleOne", { name: name ?? "" })}
      onOk={onRemove}
    >
      <Text className="textModal">{t("irreversible")}</Text>
    </Modal>
  );
};
