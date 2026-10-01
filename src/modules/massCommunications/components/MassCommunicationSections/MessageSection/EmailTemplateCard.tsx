"use client";
import { Tag, Typography } from "antd";
import { PaperclipIcon } from "lucide-react";

const { Text } = Typography;

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  body: string;
  attachments: { name: string; type: string }[];
}

interface EmailTemplateCardProps {
  template: EmailTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

export default function EmailTemplateCard({
  template,
  isSelected,
  onSelect
}: EmailTemplateCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-[#CBE71E] bg-[#CBE71E]/5"
          : "border-[#DDDDDD] bg-white hover:border-[#CBE71E]/50"
      }`}
    >
      <div className="flex justify-between gap-3 mb-1.5">
        <Text strong className="text-[13px]">
          {template.name}
        </Text>
        <Tag
          color={isSelected ? undefined : "default"}
          className={`shrink-0 text-[10px] !m-0 ${
            isSelected ? "!bg-[#CBE71E] !text-black !border-[#CBE71E]" : "!text-[#a5a5a5]"
          }`}
        >
          {isSelected ? "Seleccionado" : "Template"}
        </Tag>
      </div>

      <Text type="secondary" className="text-xs block mb-2.5">
        <Text strong className="text-xs">
          Asunto:{" "}
        </Text>
        {template.subject}
      </Text>

      {template.attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {template.attachments.map((att) => (
            <Tag
              key={att.name}
              icon={<PaperclipIcon size={10} />}
              className="!flex !items-center !gap-1 !text-[10px] !font-medium !text-black/70"
            >
              {att.name}
            </Tag>
          ))}
        </div>
      )}
    </button>
  );
}
