import { ITicket } from "@/types/chat/IChat";
import { type Conversation } from "@/modules/chat/lib/mock-data";

function getInitials(name: string | number | null | undefined): string {
  const str = String(name ?? "").trim();
  if (!str) return "";
  return str
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ticketToConversation(ticket: ITicket, unreadTicketsSet: Set<string>): Conversation {
  return {
    id: ticket.id,
    customer: ticket.customer.name,
    customerId: ticket.customer.id,
    client_name: ticket.customer.clientName,
    phoneNumber: ticket.customer.phoneNumber,
    customerCashportUUID: ticket.customer.customerCashportUUID,
    initials: getInitials(ticket.customer.name),
    phone: ticket.customer.phoneNumber,
    email: ticket.agent?.email || "",
    lastMessage: ticket.lastMessage?.content || "",
    updatedAt: ticket.updatedAt,
    tags: ticket.tags ? [ticket.tags] : [],
    timeline: [],
    status: ticket.status,
    metrics: { totalVencido: 0, ultimoPago: "" },
    hasUnreadUpdate:
      (ticket.lastViewedAt === null && ticket.lastMessage?.direction === "INBOUND") ||
      unreadTicketsSet.has(ticket.id),
    lastMessageAt: ticket.lastMessageAt,
    countMessages: ticket._count?.messages || 0
  };
}
