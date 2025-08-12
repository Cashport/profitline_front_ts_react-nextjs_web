"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import { Separator } from "@/modules/chat/ui/separator";
import { Badge } from "@/modules/chat/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/modules/chat/ui/accordion";
import type { Conversation } from "@/modules/chat/lib/mock-data";
import { useToast } from "@/modules/chat/hooks/use-toast";
import { CaretRight, ChatCircle, Copy, EnvelopeSimple } from "@phosphor-icons/react";

type Props = {
  conversation: Conversation;
  onClose?: () => void;
};

function formatCOP(value: number) {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return "$" + value.toLocaleString("es-CO");
  }
}

export default function ChatDetails({ conversation, onClose }: Props) {
  const { toast } = useToast();

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <Card className="border-[#DDDDDD]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Información del cliente</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-[#141414]"
              aria-label="Ocultar información del cliente"
            >
              <CaretRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground">Nombre</div>
              <div className="font-medium">{conversation.customer}</div>
              <div className="text-muted-foreground">Teléfono</div>
              <div className="font-medium">{conversation.phone}</div>
              <div className="text-muted-foreground">Correo</div>
              <div className="font-medium min-w-0 overflow-hidden flex items-center gap-2">
                <span className="truncate">{conversation.email ?? "—"}</span>
                {conversation.email ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground"
                    aria-label="Copiar correo"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(conversation.email!);
                        toast({ title: "Correo copiado", description: conversation.email });
                      } catch {
                        toast({ title: "No se pudo copiar", variant: "destructive" });
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copiar correo</span>
                  </Button>
                ) : null}
              </div>
              <div className="text-muted-foreground">Documento</div>
              <div className="font-medium">{conversation.document ?? "—"}</div>
              <div className="text-muted-foreground">Segmento</div>
              <div className="font-medium">{conversation.segment ?? "—"}</div>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              {conversation.tags.map((t) => (
                <Badge
                  key={t}
                  className="rounded-full bg-[#F7F7F7] text-[#141414] border border-[#DDDDDD]"
                >
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="deuda" className="border-[#DDDDDD]">
            <AccordionTrigger>Resumen de cartera</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Total vencido</div>
                <div className="font-medium">{formatCOP(conversation.metrics.totalVencido)}</div>
                <div className="text-muted-foreground">Días de atraso</div>
                <div className="font-medium">{conversation.overdueDays}</div>
                <div className="text-muted-foreground">Último pago</div>
                <div className="font-medium">{conversation.metrics.ultimoPago}</div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="historial" className="border-[#DDDDDD]">
            <AccordionTrigger>Historial de acciones</AccordionTrigger>
            <AccordionContent className="space-y-2 text-sm">
              {conversation.timeline.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {t.channel === "email" ? (
                      <EnvelopeSimple className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChatCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>{t.title}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{t.when}</div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
