import { useMemo, useState } from "react";
import { Modal, Typography, Tag, Flex, Select } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

import {
  mockContacts,
  emailTemplates,
  type IValidatedClient
} from "../../lib/mockData";

const { Text } = Typography;

interface ModalDetailClientCommunicationProps {
  open: boolean;
  onClose: () => void;
  clientInfo: IValidatedClient;
}

const TAG_REPLACEMENTS: Record<string, (client: IValidatedClient) => string> = {
  "{{Nombre Cliente}}": (c) => c.name,
  "{{ID Cliente}}": (c) => c.id,
  "{{Contacto Principal}}": () => "XXXXX",
  "{{Cartera Vencida}}": (c) => `$${c.overdueTotal.toLocaleString()}`,
  "{{Cartera 0-30 dias}}": (c) => `$${c.overdue30.toLocaleString()}`,
  "{{Cartera 31-60 dias}}": (c) => `$${c.overdue60.toLocaleString()}`,
  "{{Cartera 61-90 dias}}": (c) => `$${c.overdue90.toLocaleString()}`,
  "{{Cartera 90+ dias}}": (c) => `$${c.overdue120.toLocaleString()}`,
  "{{Cartera}}": (c) => `$${c.overdueTotal.toLocaleString()}`,
  "{{Fecha Actual}}": () => new Date().toLocaleDateString("es-CO"),
  "{{Fecha Limite Pago}}": () => "XXXXX",
  "{{Periodo}}": () => "XXXXX",
  "{{Limite de Credito}}": () => "XXXXX",
  "{{Saldo Disponible}}": () => "XXXXX",
  "{{Ultimo Pago Monto}}": () => "XXXXX",
  "{{Ultimo Pago Fecha}}": () => "XXXXX",
  "{{Nombre Ejecutivo}}": () => "XXXXX",
  "{{Telefono Ejecutivo}}": () => "XXXXX",
  "{{Email Ejecutivo}}": () => "XXXXX",
  "{{Firma}}": () => "XXXXX"
};

function personalizeForClient(text: string, client: IValidatedClient): string {
  let result = text;
  for (const [tag, resolver] of Object.entries(TAG_REPLACEMENTS)) {
    result = result.replaceAll(tag, resolver(client));
  }
  return result;
}

export default function ModalDetailClientCommunication({
  open,
  onClose,
  clientInfo
}: ModalDetailClientCommunicationProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(emailTemplates[0].id);

  const template = useMemo(
    () => emailTemplates.find((t) => t.id === selectedTemplateId) ?? emailTemplates[0],
    [selectedTemplateId]
  );

  const contacts = mockContacts[clientInfo.id] ?? [
    {
      name: clientInfo.name,
      cargo: "Contacto principal",
      email: clientInfo.email,
      phone: clientInfo.phone
    }
  ];

  const subject = personalizeForClient(template.subject, clientInfo);
  const body = personalizeForClient(template.body, clientInfo);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
      title={null}
      styles={{ body: { padding: 0 } }}
    >
      {/* Header */}
      <div
        style={{
          background: "#141414",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderRadius: "8px 8px 0 0"
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0
          }}
        >
          {clientInfo.name.charAt(0)}
        </div>
        <div>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: 600, display: "block" }}>
            {clientInfo.name}
          </Text>
          <Text style={{ color: "#999", fontSize: 11 }}>
            {contacts.length} destinatario{contacts.length !== 1 ? "s" : ""}
          </Text>
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Recipients */}
        <Flex wrap="wrap" gap={8}>
          {contacts.map((ct, i) => (
            <Tag key={i} style={{ borderRadius: 20, padding: "4px 12px", margin: 0 }}>
              <Text style={{ fontWeight: 500, fontSize: 12 }}>{ct.name}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {" · "}
                {ct.cargo}
              </Text>
              <Text style={{ fontSize: 12, color: "#2563EB" }}>
                {" · "}
                {clientInfo.channel === "email" ? ct.email : ct.phone}
              </Text>
            </Tag>
          ))}
        </Flex>

        {/* Template selector */}
        <div>
          <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
            Template
          </Text>
          <Select
            value={selectedTemplateId}
            onChange={setSelectedTemplateId}
            style={{ width: "100%", marginTop: 4 }}
            options={emailTemplates.map((t) => ({ value: t.id, label: t.name }))}
          />
        </div>

        {/* Email preview */}
        <div
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: 8,
            overflow: "hidden"
          }}
        >
          <div style={{ borderBottom: "1px solid #f0f0f0", padding: "12px 20px", background: "#fafafa" }}>
            <Text
              style={{ fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}
            >
              Asunto
            </Text>
            <br />
            <Text strong style={{ fontSize: 14 }}>
              {subject || "Sin asunto"}
            </Text>
          </div>

          <div
            style={{
              padding: "16px 20px",
              fontSize: 13,
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              minHeight: 100
            }}
          >
            {body || (
              <Text type="secondary" italic>
                Sin contenido
              </Text>
            )}
          </div>

          {template.attachments.length > 0 && (
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #f0f0f0",
                background: "#fafafa"
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  display: "block",
                  marginBottom: 8
                }}
              >
                Adjuntos
              </Text>
              <Flex wrap="wrap" gap={8}>
                {template.attachments.map((att) => (
                  <Tag key={att.name} icon={<PaperClipOutlined />}>
                    {att.name}
                  </Tag>
                ))}
              </Flex>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
