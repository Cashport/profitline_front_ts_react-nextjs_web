import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import { Col, Row } from "antd";

const FooterButtons = ({
  titleConfirm,
  titleCancel = "Cancelar",
  isConfirmDisabled = false,
  onClose,
  handleOk,
  showLeftButton = true,
  isConfirmLoading = false,
  className
}: {
  titleConfirm?: string;
  titleCancel?: string;
  isConfirmDisabled?: boolean;
  onClose: () => void;
  handleOk: () => void;
  showLeftButton?: boolean;
  isConfirmLoading?: boolean;
  className?: string;
}) => {
  if (!showLeftButton)
    return (
      <Row style={{ width: "100%" }}>
        <Col span={24} style={{ minHeight: 48 }}>
          <PrincipalButton fullWidth onClick={handleOk} disabled={isConfirmDisabled}>
            {titleConfirm ?? "Confirmar"}
          </PrincipalButton>
        </Col>
      </Row>
    );

  return (
    <Row style={{ width: "100%" }} className={className}>
      <Col span={12} style={{ paddingRight: 8, minHeight: 48 }}>
        <SecondaryButton fullWidth onClick={onClose} disabled={isConfirmLoading}>
          {titleCancel}
        </SecondaryButton>
      </Col>
      <Col span={12} style={{ paddingLeft: 8, minHeight: 48 }}>
        <PrincipalButton
          fullWidth
          onClick={handleOk}
          disabled={isConfirmDisabled || isConfirmLoading}
          loading={isConfirmLoading}
        >
          {titleConfirm ?? "Confirmar"}
        </PrincipalButton>
      </Col>
    </Row>
  );
};

export default FooterButtons;
