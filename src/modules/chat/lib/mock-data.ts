import { ITicket, IWhatsAppTemplate } from "@/types/chat/IChat";

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
  phoneNumber: string;
  customerCashportUUID: string | null;
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
  hasUnreadUpdate?: boolean;
  lastMessageAt: string;
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

// ============ MOCK DATA ============

export const mockTickets: ITicket[] = [
  {
    id: "ticket-001",
    projectId: 1,
    customerId: "cust-001",
    clientName: "Farmacia Cruz Verde",
    assignedTo: "agent-001",
    status: "OPEN",
    priority: "HIGH",
    subject: "Consulta sobre factura pendiente",
    tags: "urgente",
    metadata: null,
    closedAt: null,
    lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    customer: {
      id: "cust-001",
      name: "Maria Garcia",
      clientName: "Farmacia Cruz Verde",
      phoneNumber: "+573001234567",
      customerCashportUUID: "uuid-001"
    },
    agent: {
      id: "agent-001",
      name: "Carlos Rodriguez",
      email: "carlos@profitline.com"
    },
    _count: { messages: 12 },
    lastMessage: {
      id: "msg-001",
      content: "Buenos dias, necesito informacion sobre el estado de mi cuenta",
      type: "TEXT",
      direction: "INBOUND",
      status: "DELIVERED",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      mediaUrl: null,
      metadata: {}
    }
  },
  {
    id: "ticket-002",
    projectId: 1,
    customerId: "cust-002",
    clientName: "Drogueria La Economia",
    assignedTo: "agent-002",
    status: "OPEN",
    priority: "MEDIUM",
    subject: "Solicitud de estado de cuenta",
    tags: null,
    metadata: null,
    closedAt: null,
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    customer: {
      id: "cust-002",
      name: "Juan Perez",
      clientName: "Drogueria La Economia",
      phoneNumber: "+573109876543",
      customerCashportUUID: "uuid-002"
    },
    agent: {
      id: "agent-002",
      name: "Ana Martinez",
      email: "ana@profitline.com"
    },
    _count: { messages: 8 },
    lastMessage: {
      id: "msg-002",
      content: "Gracias por la informacion, revisare el documento",
      type: "TEXT",
      direction: "INBOUND",
      status: "READ",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      mediaUrl: null,
      metadata: {}
    }
  },
  {
    id: "ticket-003",
    projectId: 1,
    customerId: "cust-003",
    clientName: "SuperMercado El Ahorro",
    assignedTo: null,
    status: "OPEN",
    priority: "LOW",
    subject: "Consulta general",
    tags: "nuevo",
    metadata: null,
    closedAt: null,
    lastMessageAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    customer: {
      id: "cust-003",
      name: "Pedro Sanchez",
      clientName: "SuperMercado El Ahorro",
      phoneNumber: "+573205551234",
      customerCashportUUID: "uuid-003"
    },
    agent: null,
    _count: { messages: 1 },
    lastMessage: {
      id: "msg-003",
      content: "Hola, me gustaria saber el horario de atencion",
      type: "TEXT",
      direction: "INBOUND",
      status: "DELIVERED",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      mediaUrl: null,
      metadata: {}
    }
  },
  {
    id: "ticket-004",
    projectId: 1,
    customerId: "cust-004",
    clientName: "Distribuidora Nacional",
    assignedTo: "agent-001",
    status: "CLOSED",
    priority: "HIGH",
    subject: "Pago realizado",
    tags: "resuelto",
    metadata: null,
    closedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    lastMessageAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    customer: {
      id: "cust-004",
      name: "Laura Gomez",
      clientName: "Distribuidora Nacional",
      phoneNumber: "+573157778899",
      customerCashportUUID: "uuid-004"
    },
    agent: {
      id: "agent-001",
      name: "Carlos Rodriguez",
      email: "carlos@profitline.com"
    },
    _count: { messages: 25 },
    lastMessage: {
      id: "msg-004",
      content: "Perfecto, el pago ha sido registrado. Gracias por su preferencia.",
      type: "TEXT",
      direction: "OUTBOUND",
      status: "READ",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      mediaUrl: null,
      metadata: {}
    }
  },
  {
    id: "ticket-005",
    projectId: 1,
    customerId: "cust-005",
    clientName: "Tienda Mayorista ABC",
    assignedTo: "agent-002",
    status: "CLOSED",
    priority: "MEDIUM",
    subject: "Novedad de facturacion",
    tags: null,
    metadata: null,
    closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastMessageAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    customer: {
      id: "cust-005",
      name: "Roberto Diaz",
      clientName: "Tienda Mayorista ABC",
      phoneNumber: "+573123456789",
      customerCashportUUID: "uuid-005"
    },
    agent: {
      id: "agent-002",
      name: "Ana Martinez",
      email: "ana@profitline.com"
    },
    _count: { messages: 18 },
    lastMessage: {
      id: "msg-005",
      content: "Entendido, la novedad ha sido corregida.",
      type: "TEXT",
      direction: "OUTBOUND",
      status: "READ",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      mediaUrl: null,
      metadata: {}
    }
  }
];

export const mockWhatsAppTemplates: IWhatsAppTemplate[] = [
  {
    id: "template-001",
    projectId: 1,
    name: "estado_de_cuenta",
    category: "UTILITY",
    language: "es",
    status: "APPROVED",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Estado de Cuenta"
      },
      {
        type: "BODY",
        text: "Hola *{{1}}*, le informamos que su saldo pendiente es de *${{2}}* COP con vencimiento el *{{3}}*. Para mayor informacion, haga clic en el boton."
      },
      {
        type: "BUTTON",
        sub_type: "URL",
        text: "Ver detalle",
        url: "https://cashport.ai/mobile?token={{1}}"
      }
    ],
    metadata: {
      description: "Plantilla para enviar estado de cuenta al cliente"
    },
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-06-01T14:30:00.000Z"
  },
  {
    id: "template-002",
    projectId: 1,
    name: "recordatorio_pago",
    category: "UTILITY",
    language: "es",
    status: "APPROVED",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Recordatorio de Pago"
      },
      {
        type: "BODY",
        text: "Estimado(a) *{{1}}*, le recordamos que tiene una factura pendiente por valor de *${{2}}* COP. Le agradecemos realizar el pago a la brevedad posible. Si ya realizo el pago, ignore este mensaje."
      },
      {
        type: "FOOTER",
        text: "Gracias por su preferencia - Profitline"
      }
    ],
    metadata: {
      description: "Plantilla para recordar pagos pendientes"
    },
    createdAt: "2024-02-20T08:00:00.000Z",
    updatedAt: "2024-05-15T11:00:00.000Z"
  },
  {
    id: "template-003",
    projectId: 1,
    name: "confirmacion_pago",
    category: "UTILITY",
    language: "es",
    status: "APPROVED",
    components: [
      {
        type: "BODY",
        text: "Hola *{{1}}*, confirmamos la recepcion de su pago por *${{2}}* COP. Su nuevo saldo es de *${{3}}* COP. Gracias por su puntualidad."
      }
    ],
    metadata: {
      description: "Plantilla para confirmar recepcion de pagos"
    },
    createdAt: "2024-03-10T09:00:00.000Z",
    updatedAt: "2024-04-22T16:00:00.000Z"
  },
  {
    id: "template-003",
    projectId: 1,
    name: "estado_de_cuenta",
    category: "UTILITY",
    language: "es",
    status: "APPROVED",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Estado de Cuenta"
      },
      {
        type: "BODY",
        text: "Hola *{{1}}*, le informamos que su saldo pendiente es de *${{2}}* COP con vencimiento el *{{3}}*. Para mayor informacion, haga clic en el boton."
      },
      {
        type: "BUTTON",
        sub_type: "URL",
        text: "Ver detalle",
        url: "https://cashport.ai/mobile?token={{1}}"
      }
    ],
    metadata: {
      description: "Plantilla para enviar estado de cuenta al cliente"
    },
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-06-01T14:30:00.000Z"
  },
  {
    id: "template-004",
    projectId: 1,
    name: "recordatorio_pago",
    category: "UTILITY",
    language: "es",
    status: "APPROVED",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Recordatorio de Pago"
      },
      {
        type: "BODY",
        text: "Estimado(a) *{{1}}*, le recordamos que tiene una factura pendiente por valor de *${{2}}* COP. Le agradecemos realizar el pago a la brevedad posible. Si ya realizo el pago, ignore este mensaje."
      },
      {
        type: "FOOTER",
        text: "Gracias por su preferencia - Profitline"
      }
    ],
    metadata: {
      description: "Plantilla para recordar pagos pendientes"
    },
    createdAt: "2024-02-20T08:00:00.000Z",
    updatedAt: "2024-05-15T11:00:00.000Z"
  },
  {
    id: "template-005",
    projectId: 1,
    name: "confirmacion_pago",
    category: "UTILITY",
    language: "es",
    status: "APPROVED",
    components: [
      {
        type: "BODY",
        text: "Hola *{{1}}*, confirmamos la recepcion de su pago por *${{2}}* COP. Su nuevo saldo es de *${{3}}* COP. Gracias por su puntualidad."
      }
    ],
    metadata: {
      description: "Plantilla para confirmar recepcion de pagos"
    },
    createdAt: "2024-03-10T09:00:00.000Z",
    updatedAt: "2024-04-22T16:00:00.000Z"
  },
  {
    id: "template-006",
    projectId: 1,
    name: "estado_de_cuenta",
    category: "UTILITY",
    language: "es",
    status: "APPROVED",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Estado de Cuenta"
      },
      {
        type: "BODY",
        text: "Hola *{{1}}*, le informamos que su saldo pendiente es de *${{2}}* COP con vencimiento el *{{3}}*. Para mayor informacion, haga clic en el boton."
      },
      {
        type: "BUTTON",
        sub_type: "URL",
        text: "Ver detalle",
        url: "https://cashport.ai/mobile?token={{1}}"
      }
    ],
    metadata: {
      description: "Plantilla para enviar estado de cuenta al cliente"
    },
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-06-01T14:30:00.000Z"
  },
  {
    id: "template-007",
    projectId: 1,
    name: "recordatorio_pago",
    category: "UTILITY",
    language: "es",
    status: "APPROVED",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Recordatorio de Pago"
      },
      {
        type: "BODY",
        text: "Estimado(a) *{{1}}*, le recordamos que tiene una factura pendiente por valor de *${{2}}* COP. Le agradecemos realizar el pago a la brevedad posible. Si ya realizo el pago, ignore este mensaje."
      },
      {
        type: "FOOTER",
        text: "Gracias por su preferencia - Profitline"
      }
    ],
    metadata: {
      description: "Plantilla para recordar pagos pendientes"
    },
    createdAt: "2024-02-20T08:00:00.000Z",
    updatedAt: "2024-05-15T11:00:00.000Z"
  },
  {
    id: "template-008",
    projectId: 1,
    name: "confirmacion_pago",
    category: "UTILITY",
    language: "es",
    status: "APPROVED",
    components: [
      {
        type: "BODY",
        text: "Hola *{{1}}*, confirmamos la recepcion de su pago por *${{2}}* COP. Su nuevo saldo es de *${{3}}* COP. Gracias por su puntualidad."
      }
    ],
    metadata: {
      description: "Plantilla para confirmar recepcion de pagos"
    },
    createdAt: "2024-03-10T09:00:00.000Z",
    updatedAt: "2024-04-22T16:00:00.000Z"
  }
];
