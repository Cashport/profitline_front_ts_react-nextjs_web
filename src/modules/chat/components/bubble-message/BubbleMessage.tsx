import {
  ArrowsOut,
  Check,
  Checks,
  Clock,
  FileArrowDown,
  WarningCircle
} from "@phosphor-icons/react";

import { IMessage, IWhatsAppTemplate } from "@/types/chat/IChat";
import { TypeContactMessage } from "@/types/chat/messages";
import { formatTime, formatWhatsAppText } from "@/modules/chat/utils/format";

interface BubbleMessageProps {
  message: IMessage;
  customerName: string;
  templateMap: Map<string, IWhatsAppTemplate>;
  onPreviewImage: (url: string) => void;
  onScrollToBottom: () => void;
}

function ReadStatus({ mine, status }: { mine: boolean; status: string }) {
  if (!mine) return null;

  const iconMap: Record<string, React.ReactNode> = {
    DELIVERED: (
      <div className="text-[10px] text-muted-foreground">
        <Checks size={14} />
      </div>
    ),
    PENDING: (
      <div className="text-[10px] text-muted-foreground">
        <Clock size={14} color="#9c9c9c" />
      </div>
    ),
    SENT: (
      <div className="text-[10px] text-muted-foreground">
        <Check size={14} />
      </div>
    ),
    READ: (
      <div className="text-[10px] text-green-500">
        <Checks size={14} />
      </div>
    ),
    FAILED: (
      <div className="text-[20px] text-red-500">
        <WarningCircle size={18} weight="bold" />
      </div>
    )
  };

  return iconMap[status] ?? null;
}

function Footer({ timestamp, mine, status }: { timestamp: string; mine: boolean; status: string }) {
  return (
    <div className="flex items-center justify-end gap-1 mt-1">
      <div className="text-[11px] text-[#9c9c9c]">{formatTime(timestamp)}</div>
      <ReadStatus mine={mine} status={status} />
    </div>
  );
}

function BubbleWrapper({
  mine,
  customerName,
  padding = "px-3 py-2",
  bubbleClassName,
  children
}: {
  mine: boolean;
  customerName?: string;
  padding?: string;
  bubbleClassName?: string;
  children: React.ReactNode;
}) {
  const defaultBubble = mine ? "bg-[#011822] text-white" : "bg-[#EAEAEA] text-[#141414]";

  return (
    <div className={"flex " + (mine ? "justify-end" : "justify-start")}>
      <div className="max-w-[80%] md:max-w-[70%]">
        {!mine && customerName && (
          <div className="text-xs font-semibold text-[#141414] mb-2">{customerName}</div>
        )}
        <div className={`rounded-2xl text-sm ${bubbleClassName ?? defaultBubble} ${padding}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BubbleMessage({
  message: m,
  customerName,
  templateMap,
  onPreviewImage,
  onScrollToBottom
}: BubbleMessageProps) {
  const mine = m.direction === "OUTBOUND";
  const footer = <Footer timestamp={m.timestamp} mine={mine} status={m.status} />;

  if (m.type === "CONTACTS") {
    const contacts: TypeContactMessage[] = m.metadata?.contacts || [];
    if (contacts.length === 0) {
      return (
        <BubbleWrapper mine={mine} customerName={customerName} padding="p-2">
          Contacto sin datos
          {footer}
        </BubbleWrapper>
      );
    }
    return (
      <BubbleWrapper mine={mine} customerName={customerName} padding="p-2">
        <div className="space-y-2">
          {contacts.map((contact, index) => (
            <div key={index} className={contacts.length > 1 ? "border rounded-lg p-2" : ""}>
              <div className="font-semibold">{contact.name.formatted_name || "Sin nombre"}</div>
              <div className="text-sm text-muted-foreground">
                {contact.phones.map((phone) => phone.wa_id || phone.phone).join(", ") ||
                  "Sin teléfono"}
              </div>
            </div>
          ))}
        </div>
        {footer}
      </BubbleWrapper>
    );
  }

  if ((m.type === "IMAGE" || m.type === "STICKER") && m.mediaUrl) {
    return (
      <BubbleWrapper mine={mine} customerName={customerName} padding="p-2">
        <button
          onClick={() => onPreviewImage(m.mediaUrl!)}
          className="group relative block overflow-hidden rounded-lg"
          aria-label="Ver imagen"
        >
          <img
            src={m.mediaUrl ?? "/placeholder.svg"}
            alt="Imagen enviada"
            className="rounded-lg object-cover max-h-72 w-full"
            onLoad={onScrollToBottom}
          />
          <div className="absolute bottom-1 right-1 hidden rounded bg-black/40 p-1 text-white group-hover:block">
            <ArrowsOut className="h-4 w-4" />
          </div>
        </button>
        {footer}
      </BubbleWrapper>
    );
  }

  if (m.type === "DOCUMENT" && m.mediaUrl) {
    return (
      <BubbleWrapper mine={mine} customerName={customerName} padding="p-3">
        <button
          onClick={() => window.open(m.mediaUrl!, "_blank")}
          className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
          aria-label="Abrir documento"
        >
          <div className="rounded-lg bg-[#011822] p-3 border border-white/20">
            <FileArrowDown className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{m.content || "Documento"}</div>
            <div className="text-xs text-muted-foreground">Haz clic para abrir</div>
          </div>
        </button>
        {footer}
      </BubbleWrapper>
    );
  }

  if (m.type === "TEMPLATE") {
    let parsedData: any = null;
    try {
      parsedData = typeof m.templateData === "string" ? JSON.parse(m.templateData) : m.templateData;
    } catch {
      parsedData = null;
    }

    if (templateMap.size === 0) {
      return <div className="text-gray-500">Cargando plantilla...</div>;
    }

    const template = templateMap.get(m.templateName!);

    if (!template) {
      return (
        <div className="text-red-500">Plantilla &quot;{m.templateName}&quot; no encontrada</div>
      );
    }

    const templateComponents = template.components;
    const bodyComponent = templateComponents.find((c: any) => c.type === "BODY");

    const bodyParams =
      parsedData?.components?.find((c: any) => c.type === "body")?.parameters || [];
    let bodyText = bodyComponent?.text || "";

    bodyParams.forEach((p: any, i: number) => {
      bodyText = bodyText.replace(`{{${i + 1}}}`, p.text || "");
    });

    const buttonParam = parsedData?.components?.find((c: any) => c.type === "button")
      ?.parameters?.[0]?.text;
    const buttonText = buttonParam || null;

    return (
      <BubbleWrapper
        mine={mine}
        customerName={customerName}
        bubbleClassName="bg-[#011822]"
        padding="p-3"
      >
        <div
          className="text-sm text-white whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatWhatsAppText(bodyText) }}
        />
        {buttonText && (
          <a
            href={`http://cashport.ai/mobile?token=${encodeURIComponent(buttonText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block rounded-lg bg-[#CBE71E] px-3 py-1 text-xs font-semibold text-[#141414] hover:opacity-90"
          >
            Ver detalle
          </a>
        )}
        {footer}
      </BubbleWrapper>
    );
  }

  // Default: TEXT
  return (
    <BubbleWrapper mine={mine} customerName={customerName}>
      <span className="whitespace-pre-wrap">{m.content}</span>
      {footer}
    </BubbleWrapper>
  );
}
