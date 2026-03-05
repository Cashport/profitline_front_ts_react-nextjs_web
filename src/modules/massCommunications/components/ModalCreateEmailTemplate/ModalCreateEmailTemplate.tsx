import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Button, Flex, Typography, Tag, Row, Col } from "antd";
import { PaperClipOutlined, TeamOutlined } from "@ant-design/icons";

import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

const { Text, Title } = Typography;
const { CheckableTag } = Tag;

interface ModalCreateEmailTemplateProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IFormEmailTemplate {
  name: string;
  subject: string;
  body: string;
}

export default function ModalCreateEmailTemplate({
  isOpen,
  onClose
}: ModalCreateEmailTemplateProps) {
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [selectedAttachments, setSelectedAttachments] = useState<Set<string>>(new Set());

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isValid, errors }
  } = useForm<IFormEmailTemplate>({
    mode: "onChange",
    defaultValues: {
      name: "",
      subject: "",
      body: ""
    }
  });

  const subjectValue = watch("subject");
  const bodyValue = watch("body");

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedRoles(new Set());
      setSelectedAttachments(new Set());
    }
  }, [isOpen, reset]);

  const handleSave = (data: IFormEmailTemplate) => {
    console.log("Form data:", data);
    console.log("Selected roles:", Array.from(selectedRoles));
    console.log("Selected attachments:", Array.from(selectedAttachments));
  };

  const handleToggleRole = (role: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const handleToggleAttachment = (attachmentName: string) => {
    setSelectedAttachments((prev) => {
      const next = new Set(prev);
      if (next.has(attachmentName)) next.delete(attachmentName);
      else next.add(attachmentName);
      return next;
    });
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title="Crear template de email"
      width={900}
      destroyOnClose
    >
      <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
        Escribe el contenido del correo usando tags dinamicos. La vista previa se actualiza en
        tiempo real.
      </Text>

      <InputForm
        titleInput="Nombre del template"
        nameInput="name"
        control={control}
        error={errors.name}
        placeholder="Ej: Recordatorio mensual de cartera"
      />

      <Row gutter={24} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Flex vertical gap={16}>
            <InputForm
              titleInput="Asunto"
              nameInput="subject"
              control={control}
              error={errors.subject}
              placeholder="Ej: Reporte de {{Cartera}} - {{Nombre Cliente}}"
            />
            <InputForm
              titleInput="Cuerpo del mensaje"
              nameInput="body"
              control={control}
              error={errors.body}
              isTextArea
              rows={8}
              placeholder="Estimado {{Nombre Cliente}},&#10;&#10;Le informamos que su cartera actual es de {{Cartera}}...&#10;&#10;Quedamos atentos,&#10;{{Firma}}"
            />
          </Flex>
        </Col>

        <Col span={12}>
          <Title level={5} style={{ marginBottom: 8 }}>
            Vista previa
          </Title>
          <div
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: 8,
              overflow: "hidden",
              height: "calc(100% - 32px)"
            }}
          >
            <div
              style={{
                background: "#141414",
                padding: "8px 16px"
              }}
            >
              <Text
                style={{
                  color: "#999",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 1
                }}
              >
                Vista previa del correo
              </Text>
            </div>
            <div style={{ padding: 16 }}>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #f0f0f0",
                  borderRadius: 6,
                  padding: 16
                }}
              >
                <div style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 10, marginBottom: 12 }}>
                  <Text style={{ fontSize: 10, color: "#999" }}>
                    Para: destinatario@ejemplo.com
                  </Text>
                  <br />
                  <Text strong style={{ fontSize: 14 }}>
                    {subjectValue || "Sin asunto"}
                  </Text>
                </div>
                <div style={{ fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {bodyValue || (
                    <Text type="secondary" italic>
                      El contenido aparecera aqui...
                    </Text>
                  )}
                </div>
                {selectedAttachments.size > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #f0f0f0" }}>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#999",
                        textTransform: "uppercase",
                        letterSpacing: 1
                      }}
                    >
                      Adjuntos
                    </Text>
                    <Flex wrap="wrap" gap={6} style={{ marginTop: 6 }}>
                      {predefinedAttachments
                        .filter((a) => selectedAttachments.has(a.name))
                        .map((att) => (
                          <Tag key={att.name} icon={<PaperClipOutlined />}>
                            {att.name}
                          </Tag>
                        ))}
                    </Flex>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Roles destinatarios */}
      <div style={{ marginTop: 20 }}>
        <Title level={5}>Roles destinatarios</Title>
        <Flex wrap="wrap" gap={8}>
          {predefinedRoles.map((role) => (
            <CheckableTag
              key={role}
              checked={selectedRoles.has(role)}
              onChange={() => handleToggleRole(role)}
              style={{ padding: "4px 12px", borderRadius: 8, border: "1px solid #d9d9d9" }}
            >
              <TeamOutlined style={{ marginRight: 4 }} />
              {role}
            </CheckableTag>
          ))}
        </Flex>
      </div>

      {/* Adjuntos del template */}
      <div style={{ marginTop: 20 }}>
        <Title level={5}>Adjuntos del template</Title>
        <Flex wrap="wrap" gap={8}>
          {predefinedAttachments.map((att) => (
            <CheckableTag
              key={att.name}
              checked={selectedAttachments.has(att.name)}
              onChange={() => handleToggleAttachment(att.name)}
              style={{ padding: "4px 12px", borderRadius: 8, border: "1px solid #d9d9d9" }}
            >
              <PaperClipOutlined style={{ marginRight: 4 }} />
              {att.name}
              <Text type="secondary" style={{ fontSize: 9, marginLeft: 4 }}>
                {att.type}
              </Text>
            </CheckableTag>
          ))}
        </Flex>
      </div>

      {/* Footer */}
      <Flex justify="end" gap={12} style={{ marginTop: 24 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="primary" onClick={handleSubmit(handleSave)} disabled={!isValid}>
          Guardar template
        </Button>
      </Flex>
    </Modal>
  );
}

const predefinedRoles = [
  "Gerentes",
  "Tesoreros",
  "Analistas de pagos",
  "Directores financieros",
  "Contadores",
  "Asistentes administrativos"
];

const predefinedAttachments = [
  { name: "Estado de cuenta", type: "PDF" },
  { name: "Link de pago", type: "Link" },
  { name: "Reporte de cartera", type: "Excel" },
  { name: "Comprobante de pago", type: "PDF" },
  { name: "Carta pre-juridica", type: "PDF" },
  { name: "Catalogo de productos", type: "PDF" }
];
