"use client";
import { Typography } from "antd";
import { Mail, MessageCircle } from "lucide-react";

const { Text } = Typography;

export type ChannelType = "email" | "whatsapp";

interface ChannelSectionProps {
  channel: ChannelType;
  onChannelChange: (channel: ChannelType) => void;
}

const channels: { key: ChannelType; icon: typeof Mail; label: string; description: string }[] = [
  {
    key: "email",
    icon: Mail,
    label: "Email",
    description: "Correo electronico con adjuntos"
  },
  {
    key: "whatsapp",
    icon: MessageCircle,
    label: "WhatsApp",
    description: "Plantillas aprobadas con URL de descarga"
  }
];

export default function ChannelSection({ channel, onChannelChange }: ChannelSectionProps) {
  return (
    <section className="bg-white border border-[#DDDDDD] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-[#141414] text-white flex items-center justify-center text-xs font-bold">
          1
        </div>
        <Text strong className="text-[15px]">
          Canal de comunicacion
        </Text>
      </div>

      <div className="flex gap-3">
        {channels.map(({ key, icon: Icon, label, description }) => {
          const isSelected = channel === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChannelChange(key)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-lg border-2 transition-all text-left cursor-pointer ${
                isSelected
                  ? "border-[#CBE71E] bg-[#CBE71E]/5"
                  : "border-[#DDDDDD] bg-white hover:border-[#CBE71E]/50"
              }`}
            >
              <Icon size={20} className="text-[#141414]" />
              <div>
                <Text strong className="text-[13px]">
                  {label}
                </Text>
                <Text type="secondary" className="block text-xs">
                  {description}
                </Text>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
