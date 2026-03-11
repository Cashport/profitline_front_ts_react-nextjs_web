"use client";
import { useCallback } from "react";
import { Tag, Typography } from "antd";
import { Paperclip, PaperclipIcon } from "lucide-react";

const { Text } = Typography;

interface EmailPreviewProps {
  subject: string;
  body: string;
  tags: { key: string; example: string }[];
  attachments?: { name: string; type: string }[];
}

export default function EmailPreview({ subject, body, tags, attachments = [] }: EmailPreviewProps) {
  const replaceTags = useCallback(
    (text: string) => {
      let result = text;
      tags.forEach((tag) => {
        result = result.replaceAll(`{{${tag.key}}}`, tag.example);
      });
      return result;
    },
    [tags]
  );

  const renderedSubject = replaceTags(subject);
  const renderedBody = replaceTags(body);

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="bg-[#141414] px-4 py-2.5">
        <p className="text-[11px] text-gray-400 uppercase tracking-wide">Vista previa del correo</p>
      </div>

      <div className="p-4">
        <div className="border-b border-[#f0f0f0] pb-2.5 mb-3">
          <p className="text-[10px] text-gray-400">Para: destinatario@ejemplo.com</p>
          <p className="text-sm font-semibold text-[#141414]">{renderedSubject || "Sin asunto"}</p>
        </div>

        <div className="text-[13px] whitespace-pre-wrap leading-relaxed text-[#141414]">
          {renderedBody || (
            <Text type="secondary" italic>
              El contenido del mensaje aparecera aqui...
            </Text>
          )}
        </div>

        {attachments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#f0f0f0]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Adjuntos</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {attachments.map((att) => (
                <span
                  key={att.name}
                  className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded"
                >
                  <Paperclip className="w-3 h-3" />
                  {att.name}
                  <span className="text-[9px] text-gray-400">{att.type}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
