import "./ModalDeleteDiscount.scss";
import { Modal, Typography } from "antd";
import { useTranslations } from "use-intl";

const { Text } = Typography;
interface Props {
  isOpen: boolean;
  isLoading: boolean;
  name?: string;
  onClose: () => void;
  onRemove?: () => void;
}
export const ModalDeleteDiscount = ({ isOpen, isLoading, onClose, onRemove }: Props) => {
  const t = useTranslations("modals.deleteDiscount");
  const tCommon = useTranslations("common");
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      okButtonProps={{ className: "buttonOk", loading: isLoading }}
      okText={t("ok")}
      cancelText={tCommon("actions.cancel")}
      cancelButtonProps={{
        className: "buttonCancel"
      }}
      className="modalDeleteDiscount"
      title={
        <Text style={{ display: "inline-block", width: "100%", textAlign: "center" }}>
          {t("title")}
        </Text>
      }
      onOk={onRemove}
    >
      <Text style={{ display: "inline-block", width: "100%", textAlign: "center" }}>
        {t("irreversible")}
      </Text>
      <br />
    </Modal>
  );
};
