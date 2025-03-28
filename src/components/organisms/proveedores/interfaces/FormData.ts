export interface SupplierFormValues {
  companyName: string; // Razón Social
  documentNumber: string; // Número de documento
  documentType: string; // Tipo de documento
  legalRepresentative: string; // Representante legal
  supplierType: string; // Tipo de proveedor
  country: string; // País
  department: string; // Departamento
  city: string; // Ciudad
  address: string; // Dirección
  phone: string; // Teléfono
  email: string; // Correo electrónico
  economicActivity: string; // Actividad económica
  requirements: IRequirement[];
}

export enum RequirementType {
  document = "document",
  form = "form"
}
export enum Status {
  Vigente = "Vigente",
  EnAuditoria = "En auditoria",
  Pendiente = "Pendiente",
  Rechazado = "Rechazado"
}

export interface IFile {
  uid: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  uploadedAt: string;
  file: File;
  url?: string;
}

export interface IRequirement {
  id: number;
  requirementId: number;
  name: string;
  description: string;
  template?: string;
  expiryDate: string;
  approvers: string[];
  type: RequirementType;
  status: Status;
  events: Event[];
  files: IFile[];
  loadedBy?: string;
  uploadedAt: string;
  createdAt: string;
}

export interface Event {
  id: number;
  avatar: string | null; // URL del avatar o null si no hay imagen
  userName: string; // Nombre del usuario que comentó
  time: string; // Tiempo desde el comentario, como "Hace 5 horas"
  comment: string; // Texto del comentario
}
export interface RequirementToComplete {
  idRequirement: number;
  expirationDate: string;
  files: [File | string];
  events: Event[];
}
export interface DrawerData {
  title: string; // Título principal, como "RUT"
  status: Status; // Estado del documento
  description: string; // Descripción del documento
  uploadedBy: string; // Nombre de la persona que cargó el archivo
  validity: string; // Vigencia, como "3 meses"
  date: string | null; // Fecha del archivo, puede ser nula si no existe
  approvers: string[]; // Lista de nombres de aprobadores
  document: {
    fileName: string | null; // Nombre del archivo cargado, puede ser nulo si no hay archivo
    maxSize: string; // Tamaño máximo permitido, como "30MB"
    allowedFormats: string[]; // Formatos permitidos, como ['PDF', 'Word', 'PNG']
    templateUrl: string; // URL para descargar la plantilla
  };
  expirationDate: string; // Fecha de vencimiento del documento
  events: Event[];
}
