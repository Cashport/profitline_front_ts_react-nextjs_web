import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { Spin, message } from "antd";
import WhatsAppPreview from "../WhatsAppPreview/WhatsAppPreview";
import { whatsappTemplates } from "../../lib/mockData";
import { getCircularizationMessagePreview } from "@/services/communications/communications";
import type { IMessagePreview } from "@/types/communications/ICommunications";
import { extractBodyText } from "@/utils/utils";

interface ClientPreviewProps {
  communicationId: string;
  clientId: string;
  clientName: string;
  onBack?: () => void;
}

export default function ClientPreview({
  communicationId,
  clientId,
  clientName,
  onBack
}: ClientPreviewProps) {
  const searchParams = useSearchParams();
  const channel = searchParams.get("channel") ?? "email";
  const [data, setData] = useState<IMessagePreview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (channel !== "email") return;

    const fetchPreview = async () => {
      setLoading(true);
      try {
        const response = await getCircularizationMessagePreview(Number(communicationId), clientId);
        setData({
          ...response.data,
          body: extractBodyText(response.data.body)
        });
      } catch (error) {
        message.error(
          error instanceof Error ? error.message : "No se pudo cargar la vista previa del mensaje."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [communicationId, clientId, channel]);

  const recipients = data?.recipient_addresses ?? [];
  const attachments = data?.attachments ?? [];
  const primaryRecipient = recipients[0] ?? "";

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
            {clientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#141414]">{clientName}</p>
            <p className="text-xs text-gray-500">{primaryRecipient}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        {channel === "email" ? (
          <>
            {loading && (
              <div className="flex justify-center items-center py-10">
                <Spin />
              </div>
            )}

            {!loading && data && (
              <div className="bg-white rounded-lg border border-[#DDDDDD] overflow-hidden mx-auto">
                <div className="bg-[#141414] px-5 py-3">
                  <p className="text-xs text-gray-400 font-medium">
                    Correo personalizado para {clientName}
                  </p>
                </div>
                <div className="p-6">
                  <div className="border-b border-[#EEEEEE] pb-3 mb-4">
                    <p className="text-[11px] text-gray-400 mb-0.5">
                      Para: {recipients.join(", ")}
                    </p>
                    <p className="text-base font-semibold text-[#141414]">
                      {data.subject || "Sin asunto"}
                    </p>
                  </div>
                  <div className="text-sm text-[#141414] leading-relaxed whitespace-pre-wrap">
                    {data.body || <span className="italic text-gray-400">Sin contenido</span>}
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-[#EEEEEE]">
                      <p className="text-xs text-gray-500 font-medium mb-2">Adjuntos:</p>
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((att, i) => (
                          <span
                            key={i}
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
            )}
          </>
        ) : (
          <div className="max-w-md mx-auto">
            <WhatsAppPreview template={whatsappTemplates[0]} />
          </div>
        )}
      </div>
    </section>
  );
}
