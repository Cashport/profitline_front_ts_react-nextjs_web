import { Alert, Col, Modal, Row, Tag, Typography } from "antd";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import { ITemplatePreview } from "@/types/dataQuality/IIntakeStructure";

import "./modalIntakeStructure.scss";

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  preview: ITemplatePreview | null;
  /** true = usar como template, false = cargar sin template, null = cancelar. */
  // eslint-disable-next-line no-unused-vars
  onAnswer: (answer: boolean | null) => void;
}

/**
 * Se muestra cuando la regla del archivo aun no tiene template de estructura
 * (409 TEMPLATE_DECISION_REQUIRED).
 */
export const ModalTemplateDecision = ({ open, preview, onAnswer }: Props) => {
  const detected = preview?.detected;
  const canUse = !!preview?.can_use_as_template;
  const headers = preview?.template?.fields.map((f) => f.name) ?? detected?.headers ?? [];

  return (
    <Modal
      open={open}
      onCancel={() => onAnswer(null)}
      title={<Title level={4}>Este archivo aún no tiene template</Title>}
      className="modalIntakeStructure"
      width={640}
      destroyOnClose
      footer={
        <Row gutter={8} style={{ width: "100%" }}>
          <Col span={6}>
            <SecondaryButton fullWidth onClick={() => onAnswer(null)}>
              Cancelar
            </SecondaryButton>
          </Col>
          <Col span={9}>
            <SecondaryButton fullWidth onClick={() => onAnswer(false)}>
              Cargar sin template
            </SecondaryButton>
          </Col>
          <Col span={9}>
            <PrincipalButton fullWidth disabled={!canUse} onClick={() => onAnswer(true)}>
              Usar como template
            </PrincipalButton>
          </Col>
        </Row>
      }
    >
      <Text>
        ¿Quieres usar este archivo como template? Se guardarán sus encabezados y los próximos
        archivos de este tipo deberán tener las mismas columnas, en el mismo orden y en la misma
        ubicación.
      </Text>

      {canUse && detected && (
        <div className="structureSummary">
          <Text type="secondary">
            {detected.sheet ? `Hoja '${detected.sheet}', ` : ""}
            encabezados desde la celda {detected.headerCell}
            {detected.delimiter ? `, separador '${detected.delimiter}'` : ""}
          </Text>
          <div className="headerTags">
            {headers.map((h, i) => (
              <Tag key={`${h}-${i}`}>{h || "(sin nombre)"}</Tag>
            ))}
          </div>
        </div>
      )}

      {!canUse && (
        <Alert
          className="structureAlert"
          type="error"
          showIcon
          message="Este archivo no se puede usar como template"
          description={preview?.errors.map((e) => e.message).join(" ")}
        />
      )}

      {canUse && !!preview?.warnings.length && (
        <Alert
          className="structureAlert"
          type="warning"
          showIcon
          message="Revisa antes de confirmar"
          description={
            <ul>
              {preview.warnings.map((w, i) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          }
        />
      )}
    </Modal>
  );
};
