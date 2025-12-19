"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/modules/chat/ui/tabs";
import { Button } from "@/modules/chat/ui/button";
import { Textarea } from "@/modules/chat/ui/textarea";
import { Input } from "@/modules/chat/ui/input";
import { Badge } from "@/modules/chat/ui/badge";
import { getWhatsAppTemplates, sendWhatsAppTemplate } from "@/services/chat/chat";
import { IWhatsAppTemplate } from "@/types/chat/IChat";
import { getPayloadByTicket } from "@/services/clients/clients";

type EmailTemplate = { id: string; name: string; subject: string; body: string };

type Payload =
  | { channel: "whatsapp"; content: string }
  | { channel: "email"; subject: string; body: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: "whatsapp" | "email";
  onUse: (p: Payload) => void;
  ticketId: string;
};

const emailTemplates: EmailTemplate[] = [
  {
    id: "e1",
    name: "Resumen de cuenta",
    subject: "Resumen de tu estado de cuenta",
    body: "Hola {nombre},\n\nAdjuntamos tu estado de cuenta correspondiente a {periodo}. Si ya realizaste el pago, por favor ignora este mensaje.\n\nSaludos,\nEquipo Cashport"
  },
  {
    id: "e2",
    name: "Recordatorio de pago formal",
    subject: "Recordatorio de pago - {fecha_vencimiento}",
    body: "Estimado/a {nombre},\n\nTe recordamos que tu obligación con vencimiento el {fecha_vencimiento} presenta {dias_atraso} días de atraso. Monto pendiente: {monto}.\n\nPuedes regularizar aquí: {link_pago}\n\nAtentamente,\nEquipo Cashport"
  }
];

export default function TemplateDialog({ open, onOpenChange, channel, onUse, ticketId }: Props) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Plantillas de {channel === "whatsapp" ? "WhatsApp" : "Correo"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="usar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#F7F7F7]">
            <TabsTrigger value="usar">Usar</TabsTrigger>
            <TabsTrigger value="crear">Crear</TabsTrigger>
          </TabsList>

          <TabsContent value="usar" className="space-y-4 pt-4">
            {channel === "whatsapp" ? (
              <div className="space-y-3">
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
                        <div className="font-medium">{tpl.name}</div>
                        <Badge className="rounded-full bg-[#F7F7F7] text-[#141414] border border-[#DDDDDD]">
                          Texto
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
                            onUse({ channel: "whatsapp", content: bodyComponent?.text || "" })
                          }
                        >
                          Enviar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {emailTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="w-full rounded-lg border p-4"
                    style={{ borderColor: "#DDDDDD" }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-medium">{tpl.name}</div>
                      <Badge className="rounded-full bg-[#F7F7F7] text-[#141414] border border-[#DDDDDD]">
                        Correo
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold">Asunto</div>
                      <div className="text-[#606060]">{tpl.subject}</div>
                      <div className="mt-2 font-semibold">Cuerpo</div>
                      <pre className="whitespace-pre-wrap text-sm text-[#606060]">{tpl.body}</pre>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        className="text-[#141414]"
                        style={{ backgroundColor: "#CBE71E" }}
                        onClick={() => {
                          onUse({ channel: "email", subject: tpl.subject, body: tpl.body });
                          onOpenChange(false);
                        }}
                      >
                        Insertar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="crear" className="space-y-3 pt-4">
            <Input
              placeholder="Nombre de la plantilla"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#F7F7F7]"
              style={{ borderColor: "#DDDDDD" }}
            />
            {channel === "whatsapp" ? (
              <>
                <Textarea
                  placeholder="Contenido con variables: Hola {nombre}, ..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[160px] bg-[#F7F7F7]"
                  style={{ borderColor: "#DDDDDD" }}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Tip: Usa variables entre llaves, por ejemplo {"{nombre}"}.
                  </div>
                  <Button
                    disabled={!canCreateWA}
                    className="text-[#141414]"
                    style={{ backgroundColor: "#CBE71E" }}
                    onClick={() => {
                      onUse({ channel: "whatsapp", content });
                      onOpenChange(false);
                    }}
                  >
                    Insertar en el mensaje
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Input
                  placeholder="Asunto del correo"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-[#F7F7F7]"
                  style={{ borderColor: "#DDDDDD" }}
                />
                <Textarea
                  placeholder="Cuerpo del correo con variables: Estimado {nombre}, ..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[160px] bg-[#F7F7F7]"
                  style={{ borderColor: "#DDDDDD" }}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Tip: Puedes usar variables como {"{nombre}"} y {"{periodo}"}.
                  </div>
                  <Button
                    disabled={!canCreateEmail}
                    className="text-[#141414]"
                    style={{ backgroundColor: "#CBE71E" }}
                    onClick={() => {
                      onUse({ channel: "email", subject, body });
                      onOpenChange(false);
                    }}
                  >
                    Insertar en el correo
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
