import { Modal, Typography } from "antd";
import { useTranslations } from "use-intl";
import "./modalremovechanel.scss";
import { IChanel } from "@/types/bre/IBRE";
import { Fragment } from "react";

const { Text } = Typography;

interface Props {
  isOpen: boolean;
  isLoading: boolean;
  name?: string;
  onClose: () => void;
  onRemove?: () => void;
  channelData: IChanel;
}
export const ModalRemoveChanel = ({ isOpen, isLoading, channelData, onClose, onRemove }: Props) => {
  const t = useTranslations("modals.removeChannel");
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
      <Text className="title">{t("contains")}</Text>
      <br />
      <br />
      {channelData?.CHANNEL_LINES?.map((line) => (
        <Fragment key={line.id}>
          <Text className="title">{t("line", { name: line.description })} </Text>
          <br />
          {line?.sublines?.map((subline) => (
            <Text key={subline.id}> {subline.description ?? ""}.</Text>
          ))}
          <br />
          <br />
        </Fragment>
      ))}

      <Text className="title">{t("irreversible")} </Text>
    </Modal>
  );
};
