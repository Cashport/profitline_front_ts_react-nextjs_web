"use client";
import { useState, useMemo } from "react";
import { Button, Flex, Typography } from "antd";
import { ArrowLeft } from "lucide-react";

import ChannelSection from "../../components/MassCommunicationSections/ChannelSection/ChannelSection";
import RecipientsSection from "../../components/MassCommunicationSections/RecipientsSection/RecipientsSection";
import MessageSection from "../../components/MassCommunicationSections/MessageSection/MessageSection";
import ActionsBar from "../../components/MassCommunicationSections/ActionsBar/ActionsBar";
import ModalTestCommunication from "../../components/ModalTestCommunication/ModalTestCommunication";

import {
  emailTemplates,
  whatsappTemplates,
  validatedClients as mockClients
} from "../../lib/mockData";
import type { ChannelType } from "../../components/MassCommunicationSections/ChannelSection/ChannelSection";
import type { IValidatedClient, WhatsappTemplate } from "../../lib/mockData";

const { Title } = Typography;

export default function MassCommunicationsView() {
  // Channel
  const [channel, setChannel] = useState<ChannelType>("email");

  // Recipients
  const [rawIds, setRawIds] = useState("");
  const [hasValidated, setHasValidated] = useState(false);
  const [clients, setClients] = useState<IValidatedClient[]>([]);
  const [invalidIds, setInvalidIds] = useState<string[]>([]);

  // Email message
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const emailTags = useMemo(() => {
    const tpl = emailTemplates.find((t) => t.id === selectedEmailTemplate);
    if (!tpl) return [];
    const regex = /\{\{(.+?)\}\}/g;
    const tags: { key: string; example: string }[] = [];
    let match;
    while ((match = regex.exec(tpl.body + " " + tpl.subject)) !== null) {
      if (!tags.some((t) => t.key === match![1])) {
        tags.push({ key: match[1], example: `[${match[1]}]` });
      }
    }
    return tags;
  }, [selectedEmailTemplate]);

  const selectedEmailAttachments = useMemo(() => {
    const tpl = emailTemplates.find((t) => t.id === selectedEmailTemplate);
    return tpl?.attachments ?? [];
  }, [selectedEmailTemplate]);

  // WhatsApp message
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const currentTemplate = useMemo<WhatsappTemplate | null>(
    () => whatsappTemplates.find((t) => t.id === selectedTemplate) ?? null,
    [selectedTemplate]
  );

  // Modals
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  // Derived
  const canOpenPreview =
    clients.length > 0 && (channel === "email" ? !!selectedEmailTemplate : !!selectedTemplate);

  // Handlers
  const handleValidateIds = () => {
    const ids = rawIds
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const found: IValidatedClient[] = [];
    const notFound: string[] = [];

    ids.forEach((id) => {
      const client = mockClients.find((c) => c.id === id);
      if (client) found.push(client);
      else notFound.push(id);
    });

    setClients(found);
    setInvalidIds(notFound);
    setHasValidated(true);
  };

  const handleClearRecipients = () => {
    setRawIds("");
    setHasValidated(false);
    setClients([]);
    setInvalidIds([]);
  };

  const handleDownloadValidationReport = () => {
    console.log("Downloading validation report...");
  };

  const handleRawIdsChange = (value: string) => {
    setRawIds(value);
    if (hasValidated) setHasValidated(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <Flex align="center" gap={16} className="mb-6">
          <Button type="text" icon={<ArrowLeft size={16} />}>
            Inicio
          </Button>
          <Title level={3} className="!m-0">
            Comunicaciones Masivas
          </Title>
        </Flex>

        <Flex vertical gap={24}>
          <ChannelSection channel={channel} onChannelChange={setChannel} />

          <RecipientsSection
            rawIds={rawIds}
            onRawIdsChange={handleRawIdsChange}
            hasValidated={hasValidated}
            validatedClients={clients}
            invalidIds={invalidIds}
            totalClients={mockClients.length}
            onValidate={handleValidateIds}
            onClear={handleClearRecipients}
            onDownloadReport={handleDownloadValidationReport}
          />

          <MessageSection
            channel={channel}
            selectedEmailTemplate={selectedEmailTemplate}
            onSelectEmailTemplate={(id, subject, body) => {
              setSelectedEmailTemplate(id);
              setEmailSubject(subject);
              setEmailBody(body);
            }}
            emailSubject={emailSubject}
            emailBody={emailBody}
            emailTags={emailTags}
            selectedEmailAttachments={selectedEmailAttachments}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            currentTemplate={currentTemplate}
          />

          <ActionsBar
            recipientCount={clients.length}
            channel={channel}
            canOpenPreview={canOpenPreview}
            onTestCommunication={() => setTestDialogOpen(true)}
            onPreviewAndSend={() => {
              setConfirmChecked(false);
              setPreviewOpen(true);
            }}
          />
        </Flex>
      </div>

      <ModalTestCommunication
        isOpen={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        channel={channel}
      />
    </div>
  );
}
