export type IContact = { name: string; cargo: string; email: string; phone: string };

export const mockContacts: Record<string, IContact[]> = {
  "COL-001": [
    {
      name: "Ana Torres",
      cargo: "Gerente Financiero",
      email: "atorres@cruzverde.com",
      phone: "+57 300 111 0001"
    },
    {
      name: "Luis Perez",
      cargo: "Tesorero",
      email: "lperez@cruzverde.com",
      phone: "+57 300 111 0002"
    },
    {
      name: "Sofia Ruiz",
      cargo: "Analista de pagos",
      email: "sruiz@cruzverde.com",
      phone: "+57 300 111 0003"
    }
  ],
  "COL-002": [
    {
      name: "Carlos Mora",
      cargo: "Director Financiero",
      email: "cmora@colsubsidio.com",
      phone: "+57 300 222 0001"
    },
    {
      name: "Maria Lopez",
      cargo: "Tesorero",
      email: "mlopez@colsubsidio.com",
      phone: "+57 300 222 0002"
    }
  ],
  "COL-003": [
    {
      name: "Juan Gomez",
      cargo: "Gerente",
      email: "jgomez@farmatodo.co",
      phone: "+57 300 333 0001"
    },
    {
      name: "Paula Vargas",
      cargo: "Analista de pagos",
      email: "pvargas@farmatodo.co",
      phone: "+57 300 333 0002"
    }
  ],
  "COL-004": [
    {
      name: "Diego Herrera",
      cargo: "Contador",
      email: "dherrera@locatel.co",
      phone: "+57 300 444 0001"
    }
  ],
  "COL-005": [
    {
      name: "Valentina Rios",
      cargo: "Tesorero",
      email: "vrios@larebaja.com",
      phone: "+57 300 555 0001"
    },
    {
      name: "Andres Castro",
      cargo: "Gerente",
      email: "acastro@larebaja.com",
      phone: "+57 300 555 0002"
    }
  ]
};

export type IValidatedClient = {
  id: string;
  name: string;
  country: string;
  city: string;
  channel: string;
  line: string;
  email: string;
  phone: string;
  overdueTotal: number;
  overdue30: number;
  overdue60: number;
  overdue90: number;
  overdue120: number;
  blocked: boolean;
};

export const emailTemplates = [
  {
    id: "tpl-001",
    name: "Recordatorio de cartera vencida",
    description: "Notificacion estandar para clientes con cartera vencida",
    subject: "Recordatorio: Cartera vencida - {{Nombre Cliente}}",
    body: "Estimado {{Contacto Principal}},\n\nLe informamos que {{Nombre Cliente}} presenta una cartera vencida de {{Cartera Vencida}} al {{Fecha Actual}}.\n\nDesglose por antigueedad:\n- 0-30 dias: {{Cartera 0-30 dias}}\n- 31-60 dias: {{Cartera 31-60 dias}}\n- 61-90 dias: {{Cartera 61-90 dias}}\n- 90+ dias: {{Cartera 90+ dias}}\n\nLe solicitamos regularizar su situacion antes del {{Fecha Limite Pago}}.\n\nQuedamos atentos,\n{{Firma}}",
    attachments: [
      { name: "Estado de cuenta", type: "PDF" },
      { name: "Link de pago", type: "Link" }
    ]
  },
  {
    id: "tpl-002",
    name: "Estado de cuenta mensual",
    description: "Envio periodico del estado de cuenta del cliente",
    subject: "Estado de cuenta {{Periodo}} - {{Nombre Cliente}}",
    body: "Estimado {{Contacto Principal}},\n\nAdjunto encontrara el estado de cuenta de {{Nombre Cliente}} correspondiente al periodo {{Periodo}}.\n\nResumen:\n- Cartera total: {{Cartera}}\n- Cartera vencida: {{Cartera Vencida}}\n- Limite de credito: {{Limite de Credito}}\n- Saldo disponible: {{Saldo Disponible}}\n\nSi tiene alguna consulta, no dude en comunicarse con {{Nombre Ejecutivo}} al {{Telefono Ejecutivo}}.\n\nCordialmente,\n{{Firma}}",
    attachments: [
      { name: "Estado de cuenta", type: "PDF" },
      { name: "Reporte de cartera", type: "Excel" }
    ]
  },
  {
    id: "tpl-003",
    name: "Confirmacion de pago recibido",
    description: "Agradecimiento y confirmacion al recibir un pago",
    subject: "Pago recibido - {{Nombre Cliente}}",
    body: "Estimado {{Contacto Principal}},\n\nConfirmamos la recepcion de su pago por {{Ultimo Pago Monto}} con fecha {{Ultimo Pago Fecha}}.\n\nSu cartera actualizada es:\n- Cartera total: {{Cartera}}\n- Cartera vencida: {{Cartera Vencida}}\n\nAgradecemos su puntualidad.\n\nCordialmente,\n{{Firma}}",
    attachments: [{ name: "Comprobante de pago", type: "PDF" }]
  },
  {
    id: "tpl-004",
    name: "Aviso pre-juridico",
    description: "Aviso formal antes de iniciar proceso juridico",
    subject: "AVISO IMPORTANTE: Cartera en mora - {{Nombre Cliente}}",
    body: "Estimado {{Contacto Principal}},\n\nPor medio de la presente, le notificamos que {{Nombre Cliente}} (ID: {{ID Cliente}}) presenta una cartera vencida de {{Cartera Vencida}} con obligaciones vencidas superiores a 90 dias por {{Cartera 90+ dias}}.\n\nDe no recibir el pago total o un acuerdo de pago formal antes del {{Fecha Limite Pago}}, nos veremos en la necesidad de iniciar las acciones legales correspondientes.\n\nPara acuerdos de pago, comuniquese con {{Nombre Ejecutivo}} al {{Telefono Ejecutivo}} o al correo {{Email Ejecutivo}}.\n\nAtentamente,\n{{Firma}}",
    attachments: [
      { name: "Estado de cuenta", type: "PDF" },
      { name: "Carta pre-juridica", type: "PDF" }
    ]
  }
];

export type WhatsappTemplate = {
  id: string;
  name: string;
  body: string;
  variables: string[];
  attachments: { name: string; type: string }[];
};

export const waVariableExamples: Record<string, string> = {
  nombre_cliente: "Cruz Verde S.A.",
  monto_vencido: "$12,500,000",
  fecha_limite: "15/03/2026",
  periodo: "Febrero 2026"
};

export const validatedClients: IValidatedClient[] = [
  {
    id: "COL-001",
    name: "Cruz Verde S.A.",
    country: "Colombia",
    city: "Bogota",
    channel: "email",
    line: "Farmaceutica",
    email: "pagos@cruzverde.com",
    phone: "+57 300 111 0001",
    overdueTotal: 12500000,
    overdue30: 5000000,
    overdue60: 4000000,
    overdue90: 2500000,
    overdue120: 1000000,
    blocked: false
  },
  {
    id: "COL-002",
    name: "Colsubsidio",
    country: "Colombia",
    city: "Bogota",
    channel: "email",
    line: "Caja de compensacion",
    email: "tesoreria@colsubsidio.com",
    phone: "+57 300 222 0001",
    overdueTotal: 8200000,
    overdue30: 3000000,
    overdue60: 2200000,
    overdue90: 2000000,
    overdue120: 1000000,
    blocked: false
  },
  {
    id: "COL-003",
    name: "Farmatodo Colombia",
    country: "Colombia",
    city: "Bogota",
    channel: "email",
    line: "Farmaceutica",
    email: "cuentas@farmatodo.co",
    phone: "+57 300 333 0001",
    overdueTotal: 0,
    overdue30: 0,
    overdue60: 0,
    overdue90: 0,
    overdue120: 0,
    blocked: false
  }
];

export const whatsappTemplates: WhatsappTemplate[] = [
  {
    id: "wa-001",
    name: "Recordatorio de cartera",
    body: "Hola {{nombre_cliente}}, le recordamos que tiene una cartera pendiente de {{monto_vencido}}. Por favor comuniquese con nosotros para regularizar su situacion antes del {{fecha_limite}}.",
    variables: ["nombre_cliente", "monto_vencido", "fecha_limite"],
    attachments: [
      { name: "Link de pago", type: "Link" },
      { name: "Estado de cuenta", type: "PDF" }
    ]
  },
  {
    id: "wa-002",
    name: "Envio de reporte mensual",
    body: "Estimado {{nombre_cliente}}, adjuntamos el reporte mensual correspondiente al periodo {{periodo}}. Puede descargarlo en el siguiente enlace.",
    variables: ["nombre_cliente", "periodo"],
    attachments: [{ name: "Reporte mensual", type: "PDF" }]
  }
];
