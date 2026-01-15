import { ITask } from "../components/tasksTable/TasksTable";

// Types
export interface FilterState {
  filterState: string | null;
  filterComprador: string | null;
  filterVendedor: string | null;
  selectedTaskIds: string[];
}

export interface ITaskStatusGroup {
  status: string;
  status_id: number;
  tasks: ITask[];
  total: number;
  count: number;
}

// Mock Data
export const mockTasks: ITaskStatusGroup[] = [
  {
    status: "To do",
    status_id: 1,
    tasks: [
      {
        id: "1",
        cliente: "Empresa ABC S.A.",
        comprador: "Empresa ABC S.A.",
        tipoTarea: "Cobro",
        descripcion: "Seguimiento de factura pendiente por 30 días",
        estado: "Pendiente",
        responsable: "Juan Pérez",
        vendedor: "Juan Pérez",
        monto: 15000000,
        origen: "email",
        isAI: false,
        tab: "todo"
      },
      {
        id: "4",
        cliente: "Industrias del Sur",
        comprador: "Industrias del Sur",
        tipoTarea: "Cobro",
        descripcion: "Gestión de cartera vencida",
        estado: "En revisión",
        responsable: "",
        vendedor: "",
        monto: 25000000,
        origen: "email",
        isAI: true,
        tab: "todo"
      },
      {
        id: "5",
        cliente: "Grupo Empresarial Beta",
        comprador: "Grupo Empresarial Beta",
        tipoTarea: "Nota crédito",
        descripcion: "Procesar nota crédito por devolución",
        estado: "Pendiente",
        responsable: "Ana Martínez",
        vendedor: "Ana Martínez",
        monto: 5600000,
        origen: "chat",
        isAI: false,
        tab: "todo"
      }
    ],
    total: 3,
    count: 3
  },
  {
    status: "In progress",
    status_id: 2,
    tasks: [
      {
        id: "2",
        cliente: "Distribuidora XYZ",
        comprador: "Distribuidora XYZ",
        tipoTarea: "Conciliación",
        descripcion: "Revisar diferencias en estado de cuenta",
        estado: "En proceso",
        responsable: "María García",
        vendedor: "María García",
        monto: 8500000,
        origen: "chat",
        isAI: false,
        tab: "progress"
      },
      {
        id: "6",
        cliente: "Tech Solutions Ltda",
        comprador: "Tech Solutions Ltda",
        tipoTarea: "Cobro",
        descripcion: "Contactar cliente por facturas pendientes",
        estado: "En proceso",
        responsable: "Pedro Sánchez",
        vendedor: "Pedro Sánchez",
        monto: 12000000,
        origen: "phone",
        isAI: false,
        tab: "progress"
      }
    ],
    total: 2,
    count: 2
  },
  {
    status: "Done",
    status_id: 3,
    tasks: [
      {
        id: "3",
        cliente: "Comercial del Norte",
        comprador: "Comercial del Norte",
        tipoTarea: "Descuento",
        descripcion: "Aplicar descuento por pronto pago",
        estado: "Completado",
        responsable: "Carlos López",
        vendedor: "Carlos López",
        monto: 3200000,
        origen: "phone",
        isAI: false,
        tab: "done"
      },
      {
        id: "8",
        cliente: "Inversiones Omega",
        comprador: "Inversiones Omega",
        tipoTarea: "Conciliación",
        descripcion: "Revisión trimestral de cuentas",
        estado: "Completado",
        responsable: "Laura Torres",
        vendedor: "Laura Torres",
        monto: 45000000,
        origen: "email",
        isAI: false,
        tab: "done"
      }
    ],
    total: 2,
    count: 2
  },
  {
    status: "Spam",
    status_id: 4,
    tasks: [
      {
        id: "7",
        cliente: "",
        comprador: "",
        tipoTarea: "",
        descripcion: "Mensaje sin clasificar del buzón",
        estado: "Pendiente",
        responsable: "",
        vendedor: "",
        monto: 0,
        origen: "email",
        isAI: false,
        tab: "spam"
      }
    ],
    total: 1,
    count: 1
  }
];
