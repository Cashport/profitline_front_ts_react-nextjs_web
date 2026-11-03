import { Modal, Typography } from "antd";
import { useTranslations } from "use-intl";

import { Line } from "@/types/bre/IBRE";

import "./modalremoveline.scss";

const { Text } = Typography;

interface Props {
  isOpen: boolean;
  isLoading: boolean;
  name?: string;
  onClose: () => void;
  onRemove?: () => void;
  lineData: Line;
}
export const ModalRemoveLine = ({ isOpen, isLoading, lineData, onClose, onRemove }: Props) => {
  const t = useTranslations("modals.removeLine");
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
      <Text className="title">{t("line", { name: lineData.description })} </Text>
      <br />
      {lineData?.sublines?.map((subline) => (
        <Text key={subline.id}> {subline.description ?? ""}.</Text>
      ))}
      <br />
      <br />
      <Text className="title">{t("irreversible")} </Text>
    </Modal>
  );
};
