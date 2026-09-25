"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";
import { Label } from "@/modules/chat/ui/label";
import { Textarea } from "@/modules/chat/ui/textarea";
import { Button } from "@/modules/chat/ui/button";
import { Switch } from "@/modules/chat/ui/switch";
import { Badge } from "@/modules/chat/ui/badge";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onSend: (payload: { text: string; schedule?: string | null; preview: boolean }) => void;
};

export default function MassMessageSheet({ open, onOpenChange, selectedCount, onSend }: Props) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(true);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        style={{
          transition: "opacity 300ms ease-in-out",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none"
        }}
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div
        className="fixed z-50 inset-y-0 right-0 h-full w-full sm:max-w-xl bg-background border-l shadow-lg flex flex-col gap-4 p-6"
        style={{
          transition: "transform 300ms ease-in-out",
          transform: open ? "translateX(0)" : "translateX(100%)"
        }}
      >
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1.5 p-4">
          <h2 className="text-foreground font-semibold">Envío masivo por WhatsApp</h2>
          <div className="text-sm text-muted-foreground">
            Seleccionados:{" "}
            <Badge className="rounded-full bg-[#141414] text-white">{selectedCount}</Badge>
          </div>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Mensaje</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Hola {'{nombre}'} tienes {'{dias_atraso}'} días de atraso..."
              className="min-h-[140px] bg-[#F7F7F7] border-[#DDDDDD]"
            />
            <p className="text-xs text-muted-foreground">
              Soporta variables simples como {"{nombre}"} y {"{dias_atraso}"}.
            </p>
          </div>
          <div
            className="flex items-center justify-between rounded-md border p-3"
            style={{ borderColor: "#DDDDDD" }}
          >
            <div>
              <p className="text-sm font-medium">Vista previa de enlaces</p>
              <p className="text-xs text-muted-foreground">Enviar con vista previa enriquecida</p>
            </div>
            <Switch checked={preview} onCheckedChange={setPreview} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-2 p-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#DDDDDD]"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onSend({ text, schedule: null, preview })}
            className="text-[#141414]"
            style={{ backgroundColor: "#CBE71E" }}
          >
            Enviar a {selectedCount}
          </Button>
        </div>
      </div>
    </>
  );
}
