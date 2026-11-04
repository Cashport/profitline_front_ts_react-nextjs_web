import { useEffect, useState } from "react";
import { Checkbox, Flex, Modal, Typography } from "antd";
import { useTranslations } from "use-intl";

import "./modalchangestatus.scss";

const { Text } = Typography;
interface Props {
  isOpen: boolean;
  name?: string;
  isActiveStatus?: boolean;
  onClose: () => void;
  onActive?: () => void;
  onDesactivate?: () => void;
  onRemove?: () => void;
  // eslint-disable-next-line no-unused-vars
  customOnOk?: (selectedActiveState: boolean) => void;
}

export const ModalChangeStatus = ({
  isOpen,
  isActiveStatus,
  onClose,
  onActive,
  onDesactivate,
  name = "",
  onRemove,
  customOnOk
}: Props) => {
  const t = useTranslations("modals.changeStatus");
  const tCommon = useTranslations("common");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActiveStatus) return setIsActive(isActiveStatus);
  }, [isActiveStatus]);

  const onOk = async () => {
    if (onActive && onDesactivate) {
      if (isActive) return await onActive();
      return await onDesactivate();
    }
    if (customOnOk) return customOnOk(isActive);
  };
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      cancelButtonProps={{
        className: "buttonCancel"
      }}
      okText={t("ok")}
      okButtonProps={{ className: "acceptButton" }}
      className="modalChangeStatus"
      title={t("title")}
      onOk={onOk}
      cancelText={tCommon("actions.cancel")}
    >
      <Text className="textModal">{t("selectNewStatus")}</Text>
      <Flex vertical className="options">
        <Checkbox className="option" checked={isActive} onClick={() => setIsActive(true)}>
          {tCommon("status.active")}
        </Checkbox>
        <Checkbox checked={!isActive} className="option" onClick={() => setIsActive(false)}>
          {tCommon("status.inactive")}
        </Checkbox>
        {onRemove && (
          <Text onClick={onRemove} className="textRemove">
            {t("remove", { name })}
          </Text>
        )}
      </Flex>
    </Modal>
  );
};
