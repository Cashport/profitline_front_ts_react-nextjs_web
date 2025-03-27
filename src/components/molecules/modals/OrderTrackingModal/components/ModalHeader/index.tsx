import { Col, Flex, Row, Typography } from "antd";
import styles from "./ModalHeader.module.scss"; // Ajusta la ruta según tu estructura
import { IInvoiceDetail } from "../../interfaces/interface";
import { Calendar, Globe, Phone, User } from "phosphor-react";

const { Text } = Typography;

interface TransferOrderState {
  id: string;
  name: string;
  bgColor: string;
}

interface ModalHeaderProps {
  invoice: IInvoiceDetail | null;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ invoice }) => {
  if (!invoice) return <></>;
  return (
    <Flex gap={16} vertical style={{ padding: "16px 0px" }}>
      <Row>
        <Col span={8}>
          <User size={18} className={styles.icon} />
          <span className={styles.label}>Cliente</span>
        </Col>
        <Col span={16}>
          <span className={styles.value}>{invoice.client ?? ""}</span>
        </Col>
      </Row>

      <Row>
        <Col span={8}>
          <Calendar size={18} className={styles.icon} />
          <span className={styles.label}>Fecha creación</span>
        </Col>
        <Col span={16}>
          <span className={styles.value}>{invoice.createdAt ?? ""}</span>
        </Col>
      </Row>

      <Row>
        <Col span={8}>
          <Globe size={18} className={styles.icon} />
          <span className={styles.label}>Entrega</span>
        </Col>
        <Col span={16}>
          <span className={styles.value}>{invoice.deliveryAddress}</span>
        </Col>
      </Row>

      <Row>
        <Col span={8}>
          <Phone size={18} className={styles.icon} />
          <span className={styles.label}>Contacto</span>
        </Col>
        <Col span={16}>
          <span className={styles.value}>{invoice.contact}</span>
        </Col>
      </Row>
    </Flex>
  );
};

export default ModalHeader;
