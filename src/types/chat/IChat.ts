export interface ITicketCustomer {
  id: string;
  name: string;
  clientName: string;
  phoneNumber: string;
  customerCashportUUID: string | null;
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
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  customer: ITicketCustomer;
  agent: ITicketAgent | null;
  _count: ITicketCount;
  lastMessage: IMessage | null;
}

export interface IMessage {
  id: string;
  content: string;
  type: "TEXT" | "MEDIA" | "TEMPLATE" | string;
  direction: "INBOUND" | "OUTBOUND";
  status: "DELIVERED" | "SENT" | "FAILED" | "READ" | "PENDING";
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
  components: { [key: string]: string }[];
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

// Extended interfaces for socket events with additional fields
interface ICustomerSocketExtended extends ICustomerSocket {
  customerCashportUUID: string | null;
}

interface ITicketSocketExtended extends ITicketSocket {
  lastMessageAt: string | null;
}

interface IMessageSocketExtended extends Omit<IMessageSocket, "customer" | "ticket"> {
  customer: ICustomerSocketExtended;
  ticket: ITicketSocketExtended;
}

export interface ITicketUpdate {
  ticketId: string;
  message: IMessageSocketExtended;
  customer: ICustomerSocketExtended;
}

interface ISelectType {
  value: number;
  label: string;
}

export interface IAddClientForm {
  name: string;
  lastname: string;
  position: string;
  role: ISelectType;
  indicative: ISelectType;
  phone: string;
  email: string;
  client: ISelectType;
}
