import { ArrowLeft, Paperclip } from "lucide-react";
import WhatsAppPreview from "../WhatsAppPreview/WhatsAppPreview";
import { whatsappTemplates } from "../../lib/mockData";

const mockClient = {
  name: "Cruz Verde S.A.",
  email: "pagos@cruzverde.com"
};

const mockChannel: "email" | "whatsapp" = "email";

const mockEmailSubject = "Recordatorio: Cartera vencida - Cruz Verde S.A.";
const mockEmailBody =
  "Estimado Ana Torres,\n\nLe informamos que Cruz Verde S.A. presenta una cartera vencida de $12,500,000 al 05/03/2026.\n\nDesglose por antiguedad:\n- 0-30 dias: $5,000,000\n- 31-60 dias: $4,000,000\n- 61-90 dias: $2,500,000\n- 90+ dias: $1,000,000\n\nLe solicitamos regularizar su situacion antes del 15/03/2026.\n\nQuedamos atentos,\nEquipo Financiero";

const mockAttachments = [
  { name: "Estado de cuenta", type: "PDF" },
  { name: "Link de pago", type: "Link" }
];

interface ClientPreviewProps {
  onBack?: () => void;
}

export default function ClientPreview({ onBack }: ClientPreviewProps) {
  return (
    <section className="bg-white border border-[#DDDDDD] rounded-lg">
      <div className="px-6 py-4 border-b border-[#EEEEEE] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onBack?.()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#141414] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la lista
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center text-xs font-bold">
            {mockClient.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#141414]">{mockClient.name}</p>
            <p className="text-xs text-gray-500">{mockClient.email}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        {mockChannel === "email" ? (
          <div className="bg-white rounded-lg border border-[#DDDDDD] overflow-hidden max-w-3xl mx-auto">
            <div className="bg-[#141414] px-5 py-3">
              <p className="text-xs text-gray-400 font-medium">
                Correo personalizado para {mockClient.name}
              </p>
            </div>
            <div className="p-6">
              <div className="border-b border-[#EEEEEE] pb-3 mb-4">
                <p className="text-[11px] text-gray-400 mb-0.5">Para: {mockClient.email}</p>
                <p className="text-base font-semibold text-[#141414]">{mockEmailSubject}</p>
              </div>
              <div className="text-sm text-[#141414] leading-relaxed whitespace-pre-wrap">
                {mockEmailBody}
              </div>
              {mockAttachments.length > 0 && (
                <div className="mt-5 pt-4 border-t border-[#EEEEEE]">
                  <p className="text-xs text-gray-500 font-medium mb-2">Adjuntos:</p>
                  <div className="flex flex-wrap gap-2">
                    {mockAttachments.map((att) => (
                      <span
                        key={att.name}
                        className="inline-flex items-center gap-1.5 text-xs bg-gray-50 text-gray-700 border border-[#EEEEEE] px-3 py-1.5 rounded-md"
                      >
                        <Paperclip className="w-3 h-3 text-gray-400" />
                        {att.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <WhatsAppPreview template={whatsappTemplates[0]} />
          </div>
        )}
      </div>
    </section>
  );
}
