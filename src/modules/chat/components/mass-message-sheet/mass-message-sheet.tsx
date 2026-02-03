"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/modules/chat/ui/sheet";
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Añadimos padding y un ancho un poco mayor en desktop */}
      <SheetContent className="w-full sm:max-w-xl p-6">
        <SheetHeader>
          <SheetTitle>Envío masivo por WhatsApp</SheetTitle>
          <div className="text-sm text-muted-foreground">
            Seleccionados:{" "}
            <Badge className="rounded-full bg-[#141414] text-white">{selectedCount}</Badge>
          </div>
        </SheetHeader>

        {/* El padding del SheetContent ahora asegura márgenes laterales */}
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

        <SheetFooter className="mt-4">
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
