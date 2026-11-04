"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/modules/chat/ui/tabs";
import { Button } from "@/modules/chat/ui/button";
import { Textarea } from "@/modules/chat/ui/textarea";
import { Input } from "@/modules/chat/ui/input";
import { Badge } from "@/modules/chat/ui/badge";
import { Modal, Spin } from "antd";
import { getWhatsAppTemplates } from "@/services/chat/chat";
import { IWhatsAppTemplate } from "@/types/chat/IChat";
import { useTranslations } from "use-intl";

type EmailTemplate = { id: string; key: "accountSummary" | "formalReminder" };

type Payload = { channel: "whatsapp"; content: string; templateId: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: "whatsapp" | "email";
  onUse: (p: Payload) => void;
  loading?: boolean;
};

const emailTemplates: EmailTemplate[] = [
  { id: "e1", key: "accountSummary" },
  { id: "e2", key: "formalReminder" }
];

// Variables de plantilla que interpreta el envío: se muestran tal cual, no se traducen.
const TOKENS = {
  name: "{nombre}",
  period: "{periodo}",
  dueDate: "{fecha_vencimiento}",
  daysPastDue: "{dias_atraso}",
  amount: "{monto}",
  paymentLink: "{link_pago}"
};

export default function TemplateDialog({
  open,
  onOpenChange,
  channel,
  onUse,
  loading = false
}: Props) {
  const t = useTranslations("chat.templates");
  const tCommon = useTranslations("common");
  const [waTemplates, setWaTemplates] = useState<IWhatsAppTemplate[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const canCreateWA = name.trim().length > 2 && content.trim().length > 0;
  const canCreateEmail =
    name.trim().length > 2 && subject.trim().length > 0 && body.trim().length > 0;

  // Cargar plantillas dinámicas de WhatsApp
  useEffect(() => {
    if (channel === "whatsapp") {
      getWhatsAppTemplates()
        .then(setWaTemplates)
        .catch((err) => console.error("Error cargando plantillas:", err));
    }
  }, [channel]);

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={null}
      width="60%"
      title={t("title", { channel })}
    >
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 rounded-lg">
            <Spin size="large" />
          </div>
        )}

        <Tabs defaultValue="usar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#F7F7F7]">
            <TabsTrigger value="usar">{t("tabs.use")}</TabsTrigger>
            <TabsTrigger disabled value="crear">
              {tCommon("actions.create")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usar" className="space-y-4 pt-4">
            {channel === "whatsapp" ? (
              <div className="space-y-3 max-h-[calc(70*var(--vh))] overflow-y-auto">
                {waTemplates.map((tpl) => {
                  // Tomamos solo el componente BODY para mostrar en preview
                  const components = tpl.components;
                  const bodyComponent = components.find((c: any) => c.type === "BODY");
                  return (
                    <div
                      key={tpl.id}
                      className="w-full rounded-lg border p-4"
                      style={{ borderColor: "#DDDDDD" }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="font-medium">{tpl.id}</div>
                        <Badge className="rounded-full bg-[#F7F7F7] text-[#141414] border border-[#DDDDDD]">
                          {t("textBadge")}
                        </Badge>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm text-[#606060]">
                        {bodyComponent?.text}
                      </pre>
                      <div className="mt-3 flex justify-end">
                        <Button
                          className="text-[#141414]"
                          style={{ backgroundColor: "#CBE71E" }}
                          onClick={() =>
                            onUse({
                              channel: "whatsapp",
                              content: bodyComponent?.text || "",
                              templateId: tpl.id
                            })
                          }
                          disabled={tpl.usage === "INTERNAL"}
                        >
                          {tCommon("actions.send")}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(70*var(--vh))] overflow-y-auto">
                {emailTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="w-full rounded-lg border p-4"
                    style={{ borderColor: "#DDDDDD" }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-medium">{t(`email.${tpl.key}.name`)}</div>
                      <Badge className="rounded-full bg-[#F7F7F7] text-[#141414] border border-[#DDDDDD]">
                        {t("emailBadge")}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold">{t("subject")}</div>
                      <div className="text-[#606060]">{t(`email.${tpl.key}.subject`, TOKENS)}</div>
                      <div className="mt-2 font-semibold">{t("body")}</div>
                      <pre className="whitespace-pre-wrap text-sm text-[#606060]">
                        {t(`email.${tpl.key}.body`, TOKENS)}
                      </pre>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        className="text-[#141414]"
                        style={{ backgroundColor: "#CBE71E" }}
                        onClick={() => {
                          onOpenChange(false);
                        }}
                      >
                        {t("insert")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="crear" className="space-y-3 pt-4">
            <Input
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#F7F7F7]"
              style={{ borderColor: "#DDDDDD" }}
            />
            {channel === "whatsapp" ? (
              <>
                <Textarea
                  placeholder={t("contentPlaceholder", TOKENS)}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[160px] bg-[#F7F7F7]"
                  style={{ borderColor: "#DDDDDD" }}
                />
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-muted-foreground">{t("waTip", TOKENS)}</div>
                  <Button
                    disabled={!canCreateWA}
                    className="text-[#141414]"
                    style={{ backgroundColor: "#CBE71E" }}
                    onClick={() => {
                      onUse({ channel: "whatsapp", content, templateId: "" });
                      onOpenChange(false);
                    }}
                  >
                    {t("insertInMessage")}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Input
                  placeholder={t("subjectPlaceholder")}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-[#F7F7F7]"
                  style={{ borderColor: "#DDDDDD" }}
                />
                <Textarea
                  placeholder={t("bodyPlaceholder", TOKENS)}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[160px] bg-[#F7F7F7]"
                  style={{ borderColor: "#DDDDDD" }}
                />
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-muted-foreground">{t("emailTip", TOKENS)}</div>
                  <Button
                    disabled={!canCreateEmail}
                    className="text-[#141414]"
                    style={{ backgroundColor: "#CBE71E" }}
                    onClick={() => {
                      onOpenChange(false);
                    }}
                  >
                    {t("insertInEmail")}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  );
}
