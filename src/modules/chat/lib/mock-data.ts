export type Message = {
  id: string;
  from: "agent" | "customer";
  channel?: "whatsapp" | "email";
  text?: string;
  audioUrl?: string;
  imageUrl?: string;
  imageUrls?: string[];
  fileUrl?: string;
  fileName?: string;
  fileSize?: number; // bytes
  attachments?: { url: string; name: string; size: number }[];
  template?: { name: string; content?: string };
  email?: { subject: string; body: string };
  timestamp: string;
};

export type TimelineItem = {
  id: string;
  title: "Compromiso de pago" | "Pago registrado" | "Solución de novedad";
  when: string; // e.g., "1 día", "5 días", "3 meses"
  channel: "whatsapp" | "email";
};

export type Conversation = {
  id: string;
  customer: string;
  customerId: string;
  client_name: string;
  initials: string;
  phone: string;
  email?: string;
  document?: string;
  segment?: string;
  status: "Abierto" | "Cerrado";
  overdueDays: number;
  lastMessage: string;
  updatedAt: string;
  tags: string[];
  metrics: { totalVencido: number; ultimoPago: string }; // totalVencido in COP
  timeline: TimelineItem[];
  messages: Message[];
};

export function formatRelativeTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  return `${days} d`;
}
