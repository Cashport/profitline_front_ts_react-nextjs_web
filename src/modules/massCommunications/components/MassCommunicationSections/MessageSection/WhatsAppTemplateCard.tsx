"use client";
import { Tag, Typography } from "antd";
import { PaperclipIcon } from "lucide-react";
import type { WhatsappTemplate } from "../../../lib/mockData";
import { Badge } from "@/modules/chat/ui/badge";

const { Text } = Typography;

interface WhatsAppTemplateCardProps {
  template: WhatsappTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

export default function WhatsAppTemplateCard({
  template,
  isSelected,
  onSelect
}: WhatsAppTemplateCardProps) {
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
      <div className="flex justify-between gap-3 mb-2">
        <Text strong className="text-[13px]">
          {template.name}
        </Text>
        <Badge className="shrink-0 text-[10px] bg-green-100 text-green-700 border-green-200">
          Aprobada
        </Badge>
      </div>

      <Text type="secondary" ellipsis className="text-xs block mb-2">
        {template.body}
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
