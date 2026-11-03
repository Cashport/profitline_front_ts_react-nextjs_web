// Contenido de la landing pública (cashport.ai y cashport.ai/en).
// Es la única fuente del texto visible y del JSON-LD: si cambias una
// respuesta aquí, cambia en la página y en los datos estructurados a la vez,
// que es lo que exige la lectura por buscadores e IA (GEO).
import type { IconName } from "./icons";
import type { ProfitlineTarget } from "./links";

export type Lang = "es" | "en";

export interface Step {
  label: string;
  icon: IconName | "$";
}

export interface Service {
  id: string;
  name: string;
  title: { pre: string; bold: string };
  description: string;
  steps: Step[];
  link: ProfitlineTarget;
}

export interface OpsCard {
  icon: IconName;
  title: string;
  description: string;
  kpis: { value: string; label: string }[];
  tag: string;
  link: ProfitlineTarget;
}

export interface LandingContent {
  lang: Lang;
  locale: string;
  path: string;
  meta: { title: string; description: string };
  h1: string;
  skipToContent: string;
  nav: { label: string; aria: string; items: { href: string; label: string }[] };
  langSwitch: string;
  signIn: string;
  heroCta: { noAccount: string; talk: string };
  hero: {
    eyebrow: string;
    servicesAria: string;
    learnMore: (service: string) => string;
    services: Service[];
  };
  partner: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    body: string;
    link: string;
    cards: { icon: IconName | "$"; title: string; text: string; op?: "+" | "=" }[];
  };
  ops: {
    eyebrow: string;
    title: string;
    body: string;
    linkLabel: string;
    cards: OpsCard[];
    sectorsLabel: string;
    sectors: { name: string; link: ProfitlineTarget }[];
  };
  global: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    body: string;
    hqLabel: string;
    countries: { code: string; name: string; hq?: boolean; link?: ProfitlineTarget }[];
  };
  cta: { eyebrow: string; title: string; body: string; button: string };
  facts: {
    eyebrow: string;
    title: string;
    body: string;
    items: { term: string; detail: string; link?: ProfitlineTarget }[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { q: string; a: string }[];
  };
  footer: {
    text: string;
    aria: string;
    privacy: string;
    dataPolicy: string;
    contact: string;
  };
  newTab: string;
  inSpanish: string;
}

const COUNTRY_CODES = ["CO", "MX", "BR", "PE", "EC", "CL", "PA", "US", "ES"] as const;
export const AREA_SERVED = [...COUNTRY_CODES];

export const es: LandingContent = {
  lang: "es",
  locale: "es_CO",
  path: "/",
  meta: {
    title: "Profitline · Outsourcing de procesos (BPO) con tecnología propia | Cashport",
    description:
      "Profitline es una empresa de outsourcing de procesos (BPO) para empresas multinacionales. Opera Order to Cash, logística inversa, transporte de carga, sell-out y fuerzas de ventas con Cashport, su plataforma tecnológica propia."
  },
  h1: "Profitline: outsourcing de procesos con tecnología propia · Cashport",
  skipToContent: "Saltar al contenido",
  nav: {
    label: "Navegación principal",
    aria: "Idioma de la página",
    items: [
      { href: "#partner", label: "Partner operacional" },
      { href: "#operamos", label: "Qué operamos" },
      { href: "#global", label: "Presencia global" },
      { href: "#faq", label: "Preguntas frecuentes" },
      { href: "#contacto", label: "Contacto" }
    ]
  },
  langSwitch: "Idioma de la página",
  signIn: "Iniciar sesión",
  heroCta: { noAccount: "¿Aún no operamos tu proceso?", talk: "Hablemos" },
  hero: {
    eyebrow: "CASHPORT · LA INFRAESTRUCTURA TECNOLÓGICA DE PROFITLINE",
    servicesAria: "Servicios de Profitline",
    learnMore: (service) => `Conoce ${service} en profitline.co`,
    services: [
      {
        id: "o2c",
        name: "Order to Cash",
        title: { pre: "Order to ", bold: "Cash" },
        description:
          "Toda la cadena, desde la orden de compra hasta el pago, operada por nuestro equipo y visible para ti en un solo lugar.",
        steps: [
          { label: "Orden", icon: "clipboard" },
          { label: "Factura", icon: "document" },
          { label: "Acepta", icon: "check" },
          { label: "Pagos IA", icon: "spark" },
          { label: "Negocia", icon: "scale" },
          { label: "Devolución", icon: "truck" },
          { label: "Cash", icon: "$" }
        ],
        link: "orderToCash"
      },
      {
        id: "sellout",
        name: "Insights de Sell-out",
        title: { pre: "Insights de ", bold: "Sell-out" },
        description:
          "El sell-out de tus cadenas consolidado por SKU, punto de venta y región, y convertido en decisiones comerciales.",
        steps: [
          { label: "Cadenas", icon: "database" },
          { label: "SKU", icon: "tag" },
          { label: "PDV", icon: "pin" },
          { label: "Análisis", icon: "search" },
          { label: "Insights", icon: "chart" },
          { label: "Decisión", icon: "spark" }
        ],
        link: "sellOut"
      },
      {
        id: "reverse",
        name: "Logística Inversa",
        title: { pre: "Logística ", bold: "Inversa" },
        description:
          "Cada devolución de farma y consumo recogida, inspeccionada y legalizada, con trazabilidad hasta la nota crédito.",
        steps: [
          { label: "Solicitud", icon: "clipboard" },
          { label: "Recolección", icon: "truck" },
          { label: "Inspección", icon: "search" },
          { label: "Legaliza", icon: "document" },
          { label: "Nota crédito", icon: "undo" },
          { label: "Cerrada", icon: "check" }
        ],
        link: "reverseLogistics"
      },
      {
        id: "logistics",
        name: "Hub Logístico",
        title: { pre: "Hub ", bold: "Logístico" },
        description:
          "Carga doméstica planeada, asignada, rastreada y liquidada en una sola plataforma, con control de cada viaje.",
        steps: [
          { label: "Solicitud", icon: "clipboard" },
          { label: "Asignación", icon: "people" },
          { label: "Ruta", icon: "route" },
          { label: "Entrega", icon: "box" },
          { label: "Liquidación", icon: "document" },
          { label: "Facturado", icon: "check" }
        ],
        link: "logisticsHub"
      },
      {
        id: "sales",
        name: "Hub de Ventas",
        title: { pre: "Hub de ", bold: "Ventas" },
        description:
          "Tu fuerza de ventas en campo monitoreada en tiempo real: rutas, visitas georreferenciadas, pedidos y cumplimiento de metas.",
        steps: [
          { label: "Plan de ruta", icon: "route" },
          { label: "Check-in", icon: "pin" },
          { label: "Gestión", icon: "people" },
          { label: "Pedido", icon: "clipboard" },
          { label: "Indicadores", icon: "chart" },
          { label: "Meta", icon: "check" }
        ],
        link: "salesHub"
      }
    ]
  },
  partner: {
    eyebrow: "PROFITLINE · PARTNER OPERACIONAL",
    title: "Convertimos tu operación en ventaja competitiva.",
    titleAccent: "Para que sigas al frente de tu industria.",
    body: "Nos mueve que nuestros clientes compitan mejor. Por eso operamos tus procesos críticos y respondemos por el resultado, mientras tú te enfocas en crecer.",
    link: "Conoce a Profitline",
    cards: [
      {
        icon: "people",
        title: "Talento especializado",
        text: "Equipos dedicados a tu cuenta.",
        op: "+"
      },
      {
        icon: "process",
        title: "Procesos de clase mundial",
        text: "Documentados, medidos y con ANS.",
        op: "+"
      },
      {
        icon: "code",
        title: "Tecnología propia",
        text: "Plataformas que construimos nosotros.",
        op: "+"
      },
      {
        icon: "spark",
        title: "IA en la operación",
        text: "La IA ejecuta, las personas resuelven.",
        op: "="
      },
      { icon: "$", title: "Resultados como servicio", text: "Nos medimos con tus indicadores." }
    ]
  },
  ops: {
    eyebrow: "PROCESOS QUE OPERAMOS",
    title: "Operamos los procesos que mueven tu negocio",
    body: "Existimos para que el progreso de nuestros clientes no se detenga: medicamentos que deben llegar a tiempo, bienes de consumo disponibles y combustible que mantiene la industria en movimiento.",
    linkLabel: "Ver en profitline.co",
    cards: [
      {
        icon: "spark",
        title: "Order to Cash",
        description:
          "Órdenes de compra, facturación, cartera, recaudo y aplicación de pagos, de punta a punta.",
        kpis: [
          { value: "$7,8 billones", label: "transaccionados al año en nuestra plataforma O2C" },
          { value: "90%", label: "más rápida la facturación a clientes" }
        ],
        tag: "Order to Cash",
        link: "orderToCash"
      },
      {
        icon: "undo",
        title: "Logística inversa",
        description:
          "Devoluciones de farma y consumo recogidas, inspeccionadas, certificadas y legalizadas, con trazabilidad hasta la nota crédito.",
        kpis: [
          { value: "3 M", label: "unidades certificadas al año" },
          { value: "100%", label: "de cumplimiento en políticas de devolución de producto" }
        ],
        tag: "Logística Inversa",
        link: "reverseLogistics"
      },
      {
        icon: "truck",
        title: "Hub logístico",
        description:
          "Hub logístico para transporte de carga doméstica y logística inversa para farma y consumo.",
        kpis: [
          { value: "40 mil", label: "viajes monitoreados al año" },
          { value: "60%", label: "menos costo por novedades en los servicios logísticos" }
        ],
        tag: "Hub Logístico",
        link: "logisticsHub"
      },
      {
        icon: "chart",
        title: "Sell-out e insights comerciales",
        description:
          "Consolidamos el sell-out por SKU, punto de venta y cadena, y lo convertimos en decisiones comerciales.",
        kpis: [
          {
            value: "+40 mil",
            label:
              "puntos de venta con sell-out monitoreado, con integración a +800 retailers en Latinoamérica"
          },
          { value: "20 M", label: "data points procesados y armonizados por día" }
        ],
        tag: "Insights de Sell-out",
        link: "sellOut"
      }
    ],
    sectorsLabel: "SECTORES",
    sectors: [
      { name: "Farmacéutico", link: "pharma" },
      { name: "Consumo masivo", link: "consumer" },
      { name: "Oil & gas", link: "oilGas" },
      { name: "Servicios financieros", link: "financial" }
    ]
  },
  global: {
    eyebrow: "PRESENCIA GLOBAL",
    title: "Nacimos en Colombia.",
    titleAccent: "Operamos para el mundo.",
    body: "Un solo partner para toda la región: los mismos equipos, procesos y tecnología, con la misma calidad y los mismos indicadores en cada país donde operas.",
    hqLabel: "Sede principal",
    countries: [
      { code: "CO", name: "Colombia", hq: true, link: "home" },
      { code: "MX", name: "México", link: "mexico" },
      { code: "BR", name: "Brasil" },
      { code: "PE", name: "Perú" },
      { code: "EC", name: "Ecuador" },
      { code: "CL", name: "Chile" },
      { code: "PA", name: "Panamá" },
      { code: "CA", name: "Centroamérica" },
      { code: "US", name: "Estados Unidos" },
      { code: "ES", name: "España" },
      { code: "LATAM", name: "Latinoamérica" }
    ]
  },
  cta: {
    eyebrow: "HABLEMOS",
    title: "¿Tienes un proceso que no puede fallar?",
    body: "Cuéntanos cómo opera hoy. Te proponemos cómo operarlo con nuestro equipo y tecnología, y con qué indicadores nos medimos.",
    button: "Agenda una conversación"
  },
  facts: {
    eyebrow: "FICHA DE EMPRESA",
    title: "Profitline en pocas palabras",
    body: "Profitline es una empresa de outsourcing de procesos de negocio (BPO) con tecnología propia. Opera procesos críticos de cartera, recaudo, logística, sell-out y fuerzas comerciales para empresas multinacionales líderes de farma y consumo masivo, y responde por resultados medidos con ANS.",
    items: [
      { term: "Qué es", detail: "Empresa de outsourcing de procesos (BPO) con tecnología propia" },
      { term: "Fundada", detail: "2004, en Bogotá, Colombia", link: "about" },
      { term: "Clientes", detail: "Empresas multinacionales líderes en su industria" },
      {
        term: "Presencia",
        detail:
          "Colombia, México, Brasil, Perú, Ecuador, Chile, Panamá, Centroamérica, Estados Unidos y España"
      },
      {
        term: "Sectores",
        detail: "Farmacéutico, consumo masivo, oil & gas y servicios financieros"
      },
      {
        term: "Procesos",
        detail:
          "Order to Cash, logística inversa, hub logístico (TMS, Transport Management System), sell-out e insights y fuerzas de ventas",
        link: "services"
      },
      {
        term: "Tecnología propia",
        detail: "Cashport (plataforma propia de Profitline), Pharma360, TMS y Sales Intelligence",
        link: "platforms"
      },
      {
        term: "Modelo",
        detail: "Resultados como servicio, medidos con ANS e indicadores del cliente"
      }
    ]
  },
  faq: {
    eyebrow: "PREGUNTAS FRECUENTES",
    title: "Antes de entregar un proceso que no puede fallar",
    items: [
      {
        q: "¿Qué es Profitline?",
        a: "Profitline es una empresa colombiana de outsourcing de procesos de negocio (BPO), fundada en 2004 en Bogotá. Opera procesos críticos de empresas multinacionales, como cartera, recaudo, logística inversa, transporte de carga, sell-out y fuerzas comerciales, con equipos especializados, procesos medidos con ANS y Cashport, su plataforma tecnológica propia."
      },
      {
        q: "¿Qué es Cashport?",
        a: "Cashport es la plataforma tecnológica propia de Profitline; no es una empresa independiente. Profitline la desarrolla y la usa para operar el ciclo Order to Cash (órdenes de compra, facturación, cartera, recaudo y aplicación de pagos), la logística inversa, el monitoreo de transporte, el sell-out y las fuerzas de ventas. Los clientes de Profitline ingresan a Cashport en cashport.ai para ver su operación en tiempo real."
      },
      {
        q: "¿En qué se diferencia Profitline de un BPO tradicional?",
        a: "Un BPO tradicional pone personas sobre los sistemas del cliente y cobra por horas o por cabeza. Profitline es un partner operacional: opera el proceso con su propio equipo, sus propios procesos y su propia tecnología con IA, y se mide por los indicadores de negocio del cliente, como recaudo, cartera vencida o tiempos de respuesta."
      },
      {
        q: "¿Qué procesos se pueden tercerizar con Profitline?",
        a: "Order to Cash (órdenes de compra, facturación y gestión de cartera), logística inversa y certificación de devoluciones, hub logístico con TMS (Transport Management System) para planear y monitorear el transporte de carga doméstica, consolidación de sell-out e insights comerciales, y gestión y monitoreo de fuerzas de ventas en campo."
      },
      {
        q: "¿En qué países opera Profitline?",
        a: "Profitline tiene su sede en Bogotá y opera para clientes multinacionales en Colombia, México, Brasil, Perú, Ecuador, Chile, Panamá, Centroamérica, Estados Unidos y España. Además consolida el sell-out de clientes para toda Latinoamérica."
      },
      {
        q: "¿Con qué industrias trabaja Profitline?",
        a: "Profitline trabaja con empresas multinacionales, principalmente farmacéuticas y de consumo masivo, además de oil & gas y servicios financieros."
      },
      {
        q: "¿Cómo usa Profitline la inteligencia artificial?",
        a: "Profitline usa agentes de IA dentro de la operación: leen órdenes de compra, aplican pagos a facturas y gestionan la cobranza por WhatsApp. El equipo humano resuelve las excepciones y responde por el resultado."
      },
      {
        q: "¿Cómo se contrata a Profitline?",
        a: "El primer paso es una conversación con el equipo comercial para entender el proceso y definir los indicadores con los que se medirá el servicio. El contacto se hace en profitline.co/contactanos."
      }
    ]
  },
  footer: {
    text: "Cashport es la infraestructura tecnológica de Profitline, tu partner operacional",
    aria: "Legal",
    privacy: "Privacidad",
    dataPolicy: "Tratamiento de datos",
    contact: "Contacto"
  },
  newTab: "(se abre en una pestaña nueva)",
  inSpanish: ""
};

export const en: LandingContent = {
  lang: "en",
  locale: "en_US",
  path: "/en",
  meta: {
    title: "Profitline · Business process outsourcing (BPO) with proprietary technology | Cashport",
    description:
      "Profitline is a business process outsourcing (BPO) company for multinational companies. It runs Order to Cash, reverse logistics, freight transport, sell-out and field sales forces on Cashport, its proprietary technology platform."
  },
  h1: "Profitline: business process outsourcing with proprietary technology · Cashport",
  skipToContent: "Skip to content",
  nav: {
    label: "Main navigation",
    aria: "Page language",
    items: [
      { href: "#partner", label: "Operations partner" },
      { href: "#operamos", label: "What we run" },
      { href: "#global", label: "Global presence" },
      { href: "#faq", label: "FAQ" },
      { href: "#contacto", label: "Contact" }
    ]
  },
  langSwitch: "Page language",
  signIn: "Sign in",
  heroCta: { noAccount: "Not working with us yet?", talk: "Let’s talk" },
  hero: {
    eyebrow: "CASHPORT · PROFITLINE’S TECHNOLOGY INFRASTRUCTURE",
    servicesAria: "Profitline services",
    learnMore: (service) => `Explore ${service} on profitline.co`,
    services: [
      {
        id: "o2c",
        name: "Order to Cash",
        title: { pre: "Order to ", bold: "Cash" },
        description:
          "The entire chain, from purchase order to payment, run by our team and visible to you in one place.",
        steps: [
          { label: "Order", icon: "clipboard" },
          { label: "Invoice", icon: "document" },
          { label: "Accepted", icon: "check" },
          { label: "AI payments", icon: "spark" },
          { label: "Deals", icon: "scale" },
          { label: "Returns", icon: "truck" },
          { label: "Cash", icon: "$" }
        ],
        link: "orderToCash"
      },
      {
        id: "sellout",
        name: "Sell-out Insights",
        title: { pre: "Sell-out ", bold: "Insights" },
        description:
          "Your retail chains’ sell-out consolidated by SKU, point of sale and region, and turned into commercial decisions.",
        steps: [
          { label: "Retailers", icon: "database" },
          { label: "SKU", icon: "tag" },
          { label: "POS", icon: "pin" },
          { label: "Analysis", icon: "search" },
          { label: "Insights", icon: "chart" },
          { label: "Decision", icon: "spark" }
        ],
        link: "sellOut"
      },
      {
        id: "reverse",
        name: "Reverse Logistics",
        title: { pre: "Reverse ", bold: "Logistics" },
        description:
          "Every pharma and consumer goods return collected, inspected and settled, traceable all the way to the credit note.",
        steps: [
          { label: "Request", icon: "clipboard" },
          { label: "Pickup", icon: "truck" },
          { label: "Inspection", icon: "search" },
          { label: "Settlement", icon: "document" },
          { label: "Credit note", icon: "undo" },
          { label: "Closed", icon: "check" }
        ],
        link: "reverseLogistics"
      },
      {
        id: "logistics",
        name: "Logistics Hub",
        title: { pre: "Logistics ", bold: "Hub" },
        description:
          "Domestic freight planned, assigned, tracked and settled on a single platform, with control over every trip.",
        steps: [
          { label: "Request", icon: "clipboard" },
          { label: "Assignment", icon: "people" },
          { label: "Route", icon: "route" },
          { label: "Delivery", icon: "box" },
          { label: "Settlement", icon: "document" },
          { label: "Invoiced", icon: "check" }
        ],
        link: "logisticsHub"
      },
      {
        id: "sales",
        name: "Sales Hub",
        title: { pre: "Sales ", bold: "Hub" },
        description:
          "Your field sales force monitored in real time: routes, geolocated visits, orders and target attainment.",
        steps: [
          { label: "Route plan", icon: "route" },
          { label: "Check-in", icon: "pin" },
          { label: "Visit", icon: "people" },
          { label: "Order", icon: "clipboard" },
          { label: "KPIs", icon: "chart" },
          { label: "Target", icon: "check" }
        ],
        link: "salesHub"
      }
    ]
  },
  partner: {
    eyebrow: "PROFITLINE · OPERATIONS PARTNER",
    title: "We turn your operation into a competitive advantage.",
    titleAccent: "So you stay ahead in your industry.",
    body: "What drives us is helping our clients compete better. That is why we run your critical processes and own the outcome, while you focus on growing.",
    link: "Meet Profitline",
    cards: [
      {
        icon: "people",
        title: "Specialized talent",
        text: "Teams dedicated to your account.",
        op: "+"
      },
      {
        icon: "process",
        title: "World-class processes",
        text: "Documented, measured and SLA-backed.",
        op: "+"
      },
      {
        icon: "code",
        title: "Proprietary technology",
        text: "Platforms we build ourselves.",
        op: "+"
      },
      {
        icon: "spark",
        title: "AI in the operation",
        text: "AI executes, people resolve.",
        op: "="
      },
      { icon: "$", title: "Results as a service", text: "Measured by your KPIs." }
    ]
  },
  ops: {
    eyebrow: "PROCESSES WE RUN",
    title: "We run the processes that move your business",
    body: "We exist so our clients’ progress never stops: medicines that must arrive on time, consumer goods on the shelf and fuel that keeps industry moving.",
    linkLabel: "View on profitline.co",
    cards: [
      {
        icon: "spark",
        title: "Order to Cash",
        description:
          "Purchase orders, invoicing, accounts receivable, collections and payment application, end to end.",
        kpis: [
          { value: "USD 2.4 billion", label: "transacted per year on our O2C platform" },
          { value: "90%", label: "faster customer invoicing" }
        ],
        tag: "Order to Cash",
        link: "orderToCash"
      },
      {
        icon: "undo",
        title: "Reverse logistics",
        description:
          "Pharma and consumer goods returns collected, inspected, certified and settled, traceable to the credit note.",
        kpis: [
          { value: "3 M", label: "units certified per year" },
          { value: "100%", label: "compliance with product return policies" }
        ],
        tag: "Reverse Logistics",
        link: "reverseLogistics"
      },
      {
        icon: "truck",
        title: "Logistics hub",
        description:
          "Logistics hub for domestic freight transport and reverse logistics for pharma and consumer goods.",
        kpis: [
          { value: "40K", label: "trips monitored per year" },
          { value: "60%", label: "lower cost from incidents in logistics services" }
        ],
        tag: "Logistics Hub",
        link: "logisticsHub"
      },
      {
        icon: "chart",
        title: "Sell-out & commercial insights",
        description:
          "We consolidate sell-out by SKU, point of sale and retail chain, and turn it into commercial decisions.",
        kpis: [
          {
            value: "40K+",
            label:
              "points of sale with monitored sell-out, integrated with 800+ retailers across Latin America"
          },
          { value: "20 M", label: "data points processed and harmonized per day" }
        ],
        tag: "Sell-out Insights",
        link: "sellOut"
      }
    ],
    sectorsLabel: "SECTORS",
    sectors: [
      { name: "Pharmaceutical", link: "pharma" },
      { name: "Consumer goods", link: "consumer" },
      { name: "Oil & gas", link: "oilGas" },
      { name: "Financial services", link: "financial" }
    ]
  },
  global: {
    eyebrow: "GLOBAL PRESENCE",
    title: "Born in Colombia.",
    titleAccent: "Operating for the world.",
    body: "One partner for the whole region: the same teams, processes and technology, with the same quality and the same KPIs in every country where you operate.",
    hqLabel: "Headquarters",
    countries: [
      { code: "CO", name: "Colombia", hq: true, link: "home" },
      { code: "MX", name: "Mexico", link: "mexico" },
      { code: "BR", name: "Brazil" },
      { code: "PE", name: "Peru" },
      { code: "EC", name: "Ecuador" },
      { code: "CL", name: "Chile" },
      { code: "PA", name: "Panama" },
      { code: "CA", name: "Central America" },
      { code: "US", name: "United States" },
      { code: "ES", name: "Spain" },
      { code: "LATAM", name: "Latin America" }
    ]
  },
  cta: {
    eyebrow: "LET’S TALK",
    title: "Do you have a process that cannot fail?",
    body: "Tell us how it runs today. We will propose how to run it with our team and technology, and the KPIs we will be measured by.",
    button: "Schedule a conversation"
  },
  facts: {
    eyebrow: "COMPANY PROFILE",
    title: "Profitline at a glance",
    body: "Profitline is a business process outsourcing (BPO) company with proprietary technology. It runs critical accounts receivable, collections, logistics, sell-out and sales force processes for leading multinational pharma and consumer goods companies, and is accountable for SLA-measured results.",
    items: [
      {
        term: "What it is",
        detail: "Business process outsourcing (BPO) company with proprietary technology"
      },
      { term: "Founded", detail: "2004, in Bogotá, Colombia", link: "about" },
      { term: "Clients", detail: "Multinational companies that lead their industries" },
      {
        term: "Presence",
        detail:
          "Colombia, Mexico, Brazil, Peru, Ecuador, Chile, Panama, Central America, the United States and Spain"
      },
      {
        term: "Sectors",
        detail: "Pharmaceutical, consumer goods, oil & gas and financial services"
      },
      {
        term: "Processes",
        detail:
          "Order to Cash, reverse logistics, logistics hub (TMS, Transport Management System), sell-out & insights and field sales forces",
        link: "services"
      },
      {
        term: "Proprietary technology",
        detail: "Cashport (Profitline’s own platform), Pharma360, TMS and Sales Intelligence",
        link: "platforms"
      },
      { term: "Model", detail: "Results as a service, measured by SLAs and client KPIs" }
    ]
  },
  faq: {
    eyebrow: "FREQUENTLY ASKED QUESTIONS",
    title: "Before you hand over a process that cannot fail",
    items: [
      {
        q: "What is Profitline?",
        a: "Profitline is a Colombian business process outsourcing (BPO) company founded in 2004 in Bogotá. It runs critical processes for multinational companies, such as accounts receivable, collections, reverse logistics, freight transport, sell-out and field sales forces, with specialized teams, SLA-measured processes and Cashport, its proprietary technology platform."
      },
      {
        q: "What is Cashport?",
        a: "Cashport is Profitline’s proprietary technology platform; it is not a separate company. Profitline builds it and uses it to run the Order to Cash cycle (purchase orders, invoicing, accounts receivable, collections and payment application), reverse logistics, freight monitoring, sell-out and field sales forces. Profitline clients sign in to Cashport at cashport.ai to see their operation in real time."
      },
      {
        q: "How is Profitline different from a traditional BPO?",
        a: "A traditional BPO places people on the client’s systems and charges by the hour or by headcount. Profitline is an operations partner: it runs the process with its own team, its own processes and its own AI-enabled technology, and it is measured by the client’s business KPIs, such as collections, overdue receivables or response times."
      },
      {
        q: "Which processes can be outsourced to Profitline?",
        a: "Order to Cash (purchase orders, invoicing and accounts receivable management), reverse logistics and returns certification, a logistics hub with a TMS (Transport Management System) to plan and monitor domestic freight, sell-out consolidation and commercial insights, and management and monitoring of field sales forces."
      },
      {
        q: "In which countries does Profitline operate?",
        a: "Profitline is headquartered in Bogotá and serves multinational clients in Colombia, Mexico, Brazil, Peru, Ecuador, Chile, Panama, Central America, the United States and Spain. It also consolidates client sell-out data across Latin America."
      },
      {
        q: "Which industries does Profitline work with?",
        a: "Profitline works with multinational companies, mainly in pharmaceuticals and consumer goods, as well as oil & gas and financial services."
      },
      {
        q: "How does Profitline use artificial intelligence?",
        a: "Profitline uses AI agents inside the operation: they read purchase orders, apply payments to invoices and handle collections over WhatsApp. The human team resolves exceptions and owns the outcome."
      },
      {
        q: "How do you engage Profitline?",
        a: "The first step is a conversation with the sales team to understand the process and define the KPIs the service will be measured by. Contact the team at profitline.co/contactanos."
      }
    ]
  },
  footer: {
    text: "Cashport is the technology infrastructure of Profitline, your operations partner",
    aria: "Legal",
    privacy: "Privacy",
    dataPolicy: "Data processing",
    contact: "Contact"
  },
  newTab: "(opens in a new tab)",
  inSpanish: "(in Spanish)"
};

export const CONTENT: Record<Lang, LandingContent> = { es, en };
