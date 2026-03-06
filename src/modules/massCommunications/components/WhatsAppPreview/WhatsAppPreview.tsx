import { Paperclip } from "lucide-react";
import { type WhatsappTemplate, waVariableExamples } from "../../lib/mockData";

interface WhatsAppPreviewProps {
  template: WhatsappTemplate | null;
}

export default function WhatsAppPreview({ template }: WhatsAppPreviewProps) {
  if (!template) {
    return (
      <div className="bg-white rounded-lg border border-[#DDDDDD] overflow-hidden">
        <div className="bg-[#075E54] px-4 py-3">
          <p className="text-xs text-white/80 font-medium">Vista previa de WhatsApp</p>
        </div>
        <div className="flex items-center justify-center p-8 bg-[#ECE5DD]">
          <p className="text-sm text-gray-500 text-center">
            Selecciona una plantilla para ver la vista previa
          </p>
        </div>
      </div>
    );
  }

  let renderedBody = template.body;
  template.variables.forEach((v) => {
    const value = waVariableExamples[v] || `[${v}]`;
    renderedBody = renderedBody.replaceAll(`{{${v}}}`, value);
  });

  return (
    <div className="bg-white rounded-lg border border-[#DDDDDD] overflow-hidden">
      <div className="bg-[#075E54] px-4 py-3">
        <p className="text-xs text-white/80 font-medium">Vista previa de WhatsApp</p>
      </div>
      <div className="p-4 bg-[#ECE5DD]">
        <div className="max-w-[280px] bg-white rounded-lg p-3 shadow-sm">
          <p className="text-sm text-[#141414] leading-relaxed whitespace-pre-wrap">
            {renderedBody}
          </p>
          {template.attachments.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1">
              {template.attachments.map((att) => (
                <div key={att.name} className="flex items-center gap-2">
                  <Paperclip className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-blue-600 underline">{att.name}</p>
                  <span className="text-[9px] text-gray-400">{att.type}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-400 text-right mt-2">10:30 a.m.</p>
        </div>
      </div>
    </div>
  );
}
