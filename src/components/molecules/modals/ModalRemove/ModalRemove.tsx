import { Modal, Typography } from "antd";
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
  const titleFix = isMassiveAction ? "estos" : "este";
  return (
    <Modal
      className="modalRemove"
      width={"60%"}
      open={isOpen}
      onCancel={onClose}
      cancelText="Cancelar"
      okButtonProps={{ className: "acceptButton" }}
      okText="Aceptar"
      cancelButtonProps={{
        className: "cancelButton"
      }}
      title={`¿Estás seguro que deseas eliminar ${titleFix} ${name}?`}
      onOk={onRemove}
    >
      <Text className="textModal">Esta acción es definitiva</Text>
    </Modal>
  );
};
