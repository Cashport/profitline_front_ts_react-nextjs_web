import { ITicket } from "@/types/chat/IChat";
import { type Conversation } from "@/modules/chat/lib/mock-data";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ticketToConversation(
  ticket: ITicket,
  unreadTicketsSet: Set<string>
): Conversation {
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
    metrics: { totalVencido: 0, ultimoPago: "" },
    hasUnreadUpdate: ticket.lastViewedAt === null || unreadTicketsSet.has(ticket.id),
    lastMessageAt: ticket.lastMessageAt
  };
}
