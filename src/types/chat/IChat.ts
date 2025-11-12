export interface ITicketCustomer {
  id: string;
  name: string;
  clientName: string;
  phoneNumber: string;
}

export interface ITicketAgent {
  id: string;
  name?: string;
  email?: string;
}

export interface ITicketCount {
  messages: number;
}

export interface ITicket {
  id: string;
  projectId: number;
  customerId: string;
  clientName: string;
  assignedTo: string | null;
  status: string;
  priority: string;
  subject: string;
  tags: string | null;
  metadata: any | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: ITicketCustomer;
  agent: ITicketAgent | null;
  _count: ITicketCount;
}

export interface IMessage {
  id: string;
  content: string;
  type: "TEXT" | "MEDIA" | "TEMPLATE" | string;
  direction: "INBOUND" | "OUTBOUND";
  status: "DELIVERED" | "SENT" | "FAILED" | "READ";
  timestamp: string;
  mediaUrl: string | null;
  templateName?: string;
  templateData?: any;
}

interface IPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ICustomerSocket {
  id: string;
  projectId: number;
  phoneNumber: string;
  name: string;
  email: string | null;
  profileUrl: string | null;
  metadata: any | null;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ITicketSocket {
  id: string;
  projectId: number;
  customerId: string;
  assignedTo: string | null;
  status: string;
  priority: string;
  subject: string;
  tags: string | null;
  metadata: any | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IMessageSocket {
  id: string;
  projectId: number;
  ticketId: string;
  customerId: string;
  senderId: string | null;
  messageId: string;
  type: string;
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  mediaS3Key: string | null;
  templateName: string | null;
  templateData: any | null;
  status: string;
  direction: "INBOUND" | "OUTBOUND";
  timestamp: string;
  deliveredAt: string | null;
  readAt: string | null;
  errorMessage: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  customer: ICustomerSocket;
  ticket: ITicketSocket;
}

export interface IChatData {
  messages: IMessage[];
  pagination: IPagination;
}

export interface IWhatsAppTemplate {
  id: string;
  projectId: number;
  name: string;
  category: string;
  language: string;
  status: string;
  components: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}
