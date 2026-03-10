"use client";
import { Row, Col, Tag, Typography } from "antd";
import { FileText, Info } from "lucide-react";

import { emailTemplates, whatsappTemplates } from "../../../lib/mockData";
import type { WhatsappTemplate } from "../../../lib/mockData";
import type { ChannelType } from "../ChannelSection/ChannelSection";
import WhatsAppPreview from "../../WhatsAppPreview/WhatsAppPreview";
import EmailTemplateCard from "./EmailTemplateCard";
import EmailPreview from "./EmailPreview";
import WhatsAppTemplateCard from "./WhatsAppTemplateCard";

const { Text } = Typography;

interface MessageSectionProps {
  channel: ChannelType;
  selectedEmailTemplate: string;
  onSelectEmailTemplate: (id: string, subject: string, body: string) => void;
  emailSubject: string;
  emailBody: string;
  emailTags: { key: string; example: string }[];
  selectedEmailAttachments: { name: string; type: string }[];
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
  currentTemplate: WhatsappTemplate | null;
  onCreateTemplate: () => void;
}

export default function MessageSection({
  channel,
  selectedEmailTemplate,
  onSelectEmailTemplate,
  emailSubject,
  emailBody,
  emailTags,
  selectedEmailAttachments,
  selectedTemplate,
  onSelectTemplate,
  currentTemplate,
  onCreateTemplate
}: MessageSectionProps) {
  return (
    <section className="bg-white border border-[#DDDDDD] rounded-lg p-6">
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#141414] text-white flex items-center justify-center text-xs font-bold">
            3
          </div>
          <Text strong className="text-[15px]">
            Mensaje
          </Text>
          <FileText size={16} className="text-gray-400 ml-1" />
          <Tag className="ml-2">{channel === "email" ? "Email" : "WhatsApp"}</Tag>
        </div>
        {channel === "email" && (
          <button
            type="button"
            onClick={onCreateTemplate}
            className="bg-transparent border-none text-blue-500 cursor-pointer text-[13px] hover:underline"
          >
            Crear template
          </button>
        )}
      </div>

      {channel === "email" ? (
        <Row gutter={16}>
          <Col span={12}>
            <Text strong className="block text-[13px] mb-3">
              Templates de email
            </Text>
            <div className="flex flex-col gap-2">
              {emailTemplates.map((tpl) => (
                <EmailTemplateCard
                  key={tpl.id}
                  template={tpl}
                  isSelected={selectedEmailTemplate === tpl.id}
                  onSelect={() => onSelectEmailTemplate(tpl.id, tpl.subject, tpl.body)}
                />
              ))}
            </div>
          </Col>
          <Col span={12}>
            <Text strong className="block text-[13px] mb-3">
              Vista previa
            </Text>
            <div className="rounded-lg border border-[#DDDDDD] overflow-hidden">
              <EmailPreview
                subject={emailSubject}
                body={emailBody}
                tags={emailTags}
                attachments={selectedEmailAttachments}
              />
            </div>
          </Col>
        </Row>
      ) : (
        <Row gutter={16}>
          <Col span={12}>
            <Text strong className="block text-[13px] mb-3">
              Selecciona una plantilla aprobada
            </Text>
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
              {whatsappTemplates.map((tpl) => (
                <WhatsAppTemplateCard
                  key={tpl.id}
                  template={tpl}
                  isSelected={selectedTemplate === tpl.id}
                  onSelect={() => onSelectTemplate(tpl.id)}
                />
              ))}
            </div>
          </Col>
          <Col span={12}>
            <Text strong className="block text-[13px] mb-3">
              Vista previa
            </Text>
            <WhatsAppPreview template={currentTemplate} />
            {currentTemplate && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-[#DDDDDD] flex gap-2 items-start">
                <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <Text type="secondary" className="text-xs leading-relaxed">
                  Las variables{" "}
                  <Text code className="text-[11px]">
                    {currentTemplate.variables.map((v) => `{{${v}}}`).join(", ")}
                  </Text>{" "}
                  se completan automaticamente con los datos de cada cliente al momento del envio.
                </Text>
              </div>
            )}
          </Col>
        </Row>
      )}
    </section>
  );
}
