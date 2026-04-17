import { useEffect, useState } from "react";
import { Modal, Typography, Tag, Flex, Spin, message } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

import { getCircularizationMessagePreview } from "@/services/communications/communications";
import type { IMessagePreview } from "@/types/communications/ICommunications";

const { Text } = Typography;

interface ModalDetailClientCommunicationProps {
  open: boolean;
  onClose: () => void;
  communicationId: string;
  clientId: string;
}

export default function ModalDetailClientCommunication({
  open,
  onClose,
  communicationId,
  clientId
}: ModalDetailClientCommunicationProps) {
  const [data, setData] = useState<IMessagePreview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchPreview = async () => {
      setLoading(true);
      try {
        const response = await getCircularizationMessagePreview(
          Number(communicationId),
          clientId
        );
        setData(response.data);
      } catch (error) {
        message.error("No se pudo cargar la vista previa del mensaje.");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [open, communicationId, clientId]);

  const recipients = data?.recipient_addresses ?? [];
  const attachments = data?.attachments ?? [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
      title={null}
      styles={{ body: { padding: 0 }, content: { padding: 0 } }}
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
          {clientId.charAt(0).toUpperCase()}
        </div>
        <div>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: 600, display: "block" }}>
            {clientId}
          </Text>
          <Text style={{ color: "#999", fontSize: 11 }}>
            {recipients.length} destinatario{recipients.length !== 1 ? "s" : ""}
          </Text>
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {loading && (
          <Flex justify="center" align="center" style={{ padding: 24 }}>
            <Spin />
          </Flex>
        )}

        {!loading && data && (
          <>
            {/* Recipients */}
            <Flex wrap="wrap" gap={8}>
              {recipients.map((address, i) => (
                <Tag key={i} style={{ borderRadius: 20, padding: "4px 12px", margin: 0 }}>
                  <Text style={{ fontSize: 12, color: "#2563EB" }}>{address}</Text>
                </Tag>
              ))}
            </Flex>

            {/* Email preview */}
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid #f0f0f0",
                  padding: "12px 20px",
                  background: "#fafafa"
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: 1
                  }}
                >
                  Asunto
                </Text>
                <br />
                <Text strong style={{ fontSize: 14 }}>
                  {data.subject || "Sin asunto"}
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
                {data.body || (
                  <Text type="secondary" italic>
                    Sin contenido
                  </Text>
                )}
              </div>

              {attachments.length > 0 && (
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
                    {attachments.map((att, i) => (
                      <Tag key={i} icon={<PaperClipOutlined />}>
                        {att.name}
                      </Tag>
                    ))}
                  </Flex>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
