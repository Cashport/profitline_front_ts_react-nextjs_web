export type Message = {
  id: string
  from: "agent" | "customer"
  channel?: "whatsapp" | "email"
  text?: string
  audioUrl?: string
  imageUrl?: string
  imageUrls?: string[]
  fileUrl?: string
  fileName?: string
  fileSize?: number // bytes
  attachments?: { url: string; name: string; size: number }[]
  template?: { name: string; content?: string }
  email?: { subject: string; body: string }
  timestamp: string
}

export type TimelineItem = {
  id: string
  title: "Compromiso de pago" | "Pago registrado" | "Solución de novedad"
  when: string // e.g., "1 día", "5 días", "3 meses"
  channel: "whatsapp" | "email"
}

export type Conversation = {
  id: string
  customer: string
  initials: string
  phone: string
  email?: string
  document?: string
  segment?: string
  status: "Abierto" | "Cerrado"
  overdueDays: number
  lastMessage: string
  updatedAt: string
  tags: string[]
  metrics: { totalVencido: number; ultimoPago: string } // totalVencido in COP
  timeline: TimelineItem[]
  messages: Message[]
}

export const conversationsMock: Conversation[] = [
  {
    id: "1",
    customer: "Marita Esmeralda Ramos Paiva",
    initials: "MR",
    phone: "+51 993 346 829",
    email: "mmartinez@profitline.com.co",
    document: "DNI 50311915",
    segment: "High Risk",
    status: "Abierto",
    overdueDays: 10,
    lastMessage: "Marita Esmeralda, tienes 10 días de atraso...",
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    tags: ["Pendiente", "WhatsApp"],
    metrics: { totalVencido: 5850000, ultimoPago: "12/02/24" },
    timeline: [
      { id: "t1", title: "Compromiso de pago", when: "5 días", channel: "whatsapp" },
      { id: "t2", title: "Pago registrado", when: "1 día", channel: "email" },
    ],
    messages: [
      {
        id: "m1",
        channel: "whatsapp",
        from: "agent",
        text:
          "Marita Esmeralda, tienes 10 días de atraso. Honrar tus créditos es importante para mantener un buen score.",
        timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      },
      {
        id: "m2",
        channel: "whatsapp",
        from: "customer",
        text: "Gracias, ¿puedo hacer el pago hoy por la tarde?",
        timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      },
      {
        id: "m3",
        channel: "whatsapp",
        from: "agent",
        template: { name: "Recordatorio de pago" },
        text:
          "Hola Marita Esmeralda Ramos Paiva, tienes 10 días de atraso. Tu saldo pendiente es USD 1,500.00. Puedes pagar aquí: https://pay.cashport.example/1",
        timestamp: new Date(Date.now() - 1000 * 60 * 36).toISOString(),
      },
      {
        id: "m4",
        channel: "whatsapp",
        from: "agent",
        fileUrl: "/files/estado-de-cuenta.pdf",
        fileName: "estado-de-cuenta.pdf",
        fileSize: 482394,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: "m5",
        channel: "whatsapp",
        from: "customer",
        imageUrl: "/placeholder.svg?height=480&width=360",
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
      {
        id: "m6",
        channel: "whatsapp",
        from: "agent",
        audioUrl: "",
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
      {
        id: "m7",
        channel: "email",
        from: "agent",
        email: {
          subject: "Resumen de tu estado de cuenta",
          body:
            "Hola Marita,\n\nAdjuntamos tu estado de cuenta. Si ya realizaste el pago, por favor ignora este mensaje.\n\nSaludos,\nEquipo Cashport",
        },
        attachments: [{ url: "/files/estado-de-cuenta.pdf", name: "estado-de-cuenta.pdf", size: 482394 }],
        imageUrls: ["/placeholder.svg?height=180&width=320"],
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      },
    ],
  },
  {
    id: "2",
    customer: "Lourdes Analy Ruiz Rios",
    initials: "LR",
    phone: "+51 955 111 222",
    email: "lourdes@example.com",
    status: "Abierto",
    overdueDays: 6,
    lastMessage: "¿Podrías enviarme el estado de cuenta?",
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    tags: ["Seguimiento", "Prioridad"],
    metrics: { totalVencido: 1900000, ultimoPago: "05/03/24" },
    timeline: [{ id: "t1", title: "Solución de novedad", when: "3 meses", channel: "email" }],
    messages: [
      {
        id: "m1",
        channel: "whatsapp",
        from: "customer",
        text: "¿Podrías enviarme el estado de cuenta?",
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
    ],
  },
  {
    id: "3",
    customer: "Noemi Ruth Mendez Fabian",
    initials: "NM",
    phone: "+51 900 555 123",
    email: "noemi@example.com",
    status: "Cerrado",
    overdueDays: 0,
    lastMessage: "Gracias, ya quedó al día.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    tags: ["Cerrado"],
    metrics: { totalVencido: 0, ultimoPago: "01/03/24" },
    timeline: [{ id: "t1", title: "Pago registrado", when: "1 día", channel: "whatsapp" }],
    messages: [
      {
        id: "m1",
        channel: "whatsapp",
        from: "agent",
        text: "Confirmamos tu pago, ¡gracias!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
      },
      {
        id: "m2",
        channel: "whatsapp",
        from: "customer",
        text: "Gracias, ya quedó al día.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      },
    ],
  },
]

export function formatRelativeTime(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "ahora"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.round(hours / 24)
  return `${days} d`
}
