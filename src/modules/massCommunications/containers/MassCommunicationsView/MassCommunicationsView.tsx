"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Flex, Typography } from "antd";

import ChannelSection from "../../components/MassCommunicationSections/ChannelSection/ChannelSection";
import RecipientsSection from "../../components/MassCommunicationSections/RecipientsSection/RecipientsSection";
import MessageSection from "../../components/MassCommunicationSections/MessageSection/MessageSection";
import ActionsBar from "../../components/MassCommunicationSections/ActionsBar/ActionsBar";
import ModalTestCommunication from "../../components/ModalTestCommunication/ModalTestCommunication";
import ModalCreateEmailTemplate from "../../components/ModalCreateEmailTemplate/ModalCreateEmailTemplate";

import {
  getMassiveCommunicationTemplates,
  getTemplateTags
} from "@/services/communications/communications";
import { getWhatsAppTemplates } from "@/services/chat/chat";
import type { EmailTemplate } from "../../components/MassCommunicationSections/MessageSection/EmailTemplateCard";
import type { ChannelType } from "../../components/MassCommunicationSections/ChannelSection/ChannelSection";
import type { WhatsappTemplate } from "../../lib/mockData";

const { Title } = Typography;

export default function MassCommunicationsView() {
  const router = useRouter();

  // Channel
  const [channel, setChannel] = useState<ChannelType>("email");

  // Recipients
  const [validatedCount, setValidatedCount] = useState(0);

  // Email message
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [apiTags, setApiTags] = useState<{ id: number; name: string; mock: string }[]>([]);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const fetchEmailTemplates = useCallback(async () => {
    try {
      const data = await getMassiveCommunicationTemplates();
      const mapped: EmailTemplate[] = data.map((t) => ({
        id: t.id.toString(),
        name: t.name,
        description: t.description,
        subject: t.subject,
        body: t.message,
        attachments: t.attachments.map((att) => {
          const fileName = typeof att === "string" ? att : att.name;
          const parts = fileName.split(".");
          const ext = parts.length > 1 ? parts.pop()!.toUpperCase() : "FILE";
          const name = parts.join(".");
          return { name, type: ext };
        })
      }));
      setEmailTemplates(mapped);
    } catch (err) {
      console.error("Error fetching email templates:", err);
    }
  }, []);

  useEffect(() => {
    if (channel !== "email") return;
    fetchEmailTemplates();

    getTemplateTags()
      .then((tags) => setApiTags(tags))
      .catch((err) => console.error("Error fetching template tags", err));
  }, [channel]);

  const emailTags = useMemo(() => {
    const tpl = emailTemplates.find((t) => t.id === selectedEmailTemplate);
    if (!tpl) return [];
    const regex = /\{\{(.+?)\}\}/g;
    const tags: { key: string; example: string }[] = [];
    let match;
    while ((match = regex.exec(tpl.body + " " + tpl.subject)) !== null) {
      if (!tags.some((t) => t.key === match![1])) {
        const apiTag = apiTags.find((t) => t.name === match![1]);
        tags.push({ key: match[1], example: apiTag?.mock ?? `[${match[1]}]` });
      }
    }
    return tags;
  }, [selectedEmailTemplate, emailTemplates, apiTags]);

  const selectedEmailAttachments = useMemo(() => {
    const tpl = emailTemplates.find((t) => t.id === selectedEmailTemplate);
    return tpl?.attachments ?? [];
  }, [selectedEmailTemplate, emailTemplates]);

  // WhatsApp message
  const [waTemplates, setWaTemplates] = useState<WhatsappTemplate[]>([]);
  const [waTemplatesLoading, setWaTemplatesLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  useEffect(() => {
    if (channel !== "whatsapp") return;
    setWaTemplatesLoading(true);
    getWhatsAppTemplates()
      .then((data) => {
        const mapped: WhatsappTemplate[] = data.map((t) => {
          const bodyComponent = t.components.find((c: Record<string, string>) => c.type === "BODY");
          const bodyText = (bodyComponent?.text ?? "").replace(/\*/g, "");
          const variables: string[] = [];
          const varRegex = /\{\{(\d+)\}\}/g;
          let match;
          while ((match = varRegex.exec(bodyText)) !== null) {
            if (!variables.includes(match[1])) variables.push(match[1]);
          }
          const attachments = t.components
            .filter((c: Record<string, string>) => c.type === "BUTTON" && c.sub_type === "URL")
            .map((c: Record<string, string>) => ({ name: c.text, type: "Link" }));

          return {
            id: t.id,
            name: t.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            body: bodyText,
            variables,
            attachments
          };
        });
        setWaTemplates(mapped);
      })
      .catch((err) => console.error("Error fetching WhatsApp templates:", err))
      .finally(() => setWaTemplatesLoading(false));
  }, [channel]);

  const currentTemplate = useMemo<WhatsappTemplate | null>(
    () => waTemplates.find((t) => t.id === selectedTemplate) ?? null,
    [selectedTemplate, waTemplates]
  );

  // Modals
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  // Derived
  const canOpenPreview =
    validatedCount > 0 && (channel === "email" ? !!selectedEmailTemplate : !!selectedTemplate);

  const handlePreviewAndSend = () => {
    if (!canOpenPreview) return;
    router.push("/mass-communications/" + selectedEmailTemplate);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <Flex align="center" gap={16} className="mb-6">
          <Title level={3} className="!m-0">
            Comunicaciones Masivas
          </Title>
        </Flex>

        <Flex vertical gap={24}>
          <ChannelSection channel={channel} onChannelChange={setChannel} />

          <RecipientsSection onValidatedCountChange={setValidatedCount} />

          <MessageSection
            channel={channel}
            emailTemplates={emailTemplates}
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
            waTemplates={waTemplates}
            waTemplatesLoading={waTemplatesLoading}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            currentTemplate={currentTemplate}
            onCreateTemplate={() => setCreateTemplateOpen(true)}
          />

          <ActionsBar
            recipientCount={validatedCount}
            channel={channel}
            canOpenPreview={canOpenPreview}
            onTestCommunication={() => setTestDialogOpen(true)}
            onPreviewAndSend={handlePreviewAndSend}
          />
        </Flex>
      </div>

      <ModalCreateEmailTemplate
        isOpen={createTemplateOpen}
        onClose={() => setCreateTemplateOpen(false)}
        templateTags={apiTags.map((t) => ({ value: t.id, label: t.name, mock: t.mock }))}
        onSuccess={fetchEmailTemplates}
      />

      <ModalTestCommunication
        isOpen={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        channel={channel}
      />
    </div>
  );
}
