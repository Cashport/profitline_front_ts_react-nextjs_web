import * as Yup from "yup";
// Validation Schema
export const validationSchema = Yup.object().shape({
  companyName: Yup.string().required("Razón Social es requerida"),
  documentNumber: Yup.string().required("Número de documento es requerido"),
  documentType: Yup.string().required("Seleccione el tipo de documento"),
  legalRepresentative: Yup.string().required("Nombre del representante legal es requerido"),
  supplierType: Yup.string().required("Seleccione el tipo de proveedor"),
  country: Yup.string().required("Seleccione el país"),
  department: Yup.string().required("Seleccione el departamento"),
  city: Yup.string().required("Seleccione la ciudad"),
  address: Yup.string().required("Dirección de entrega es requerida"),
  phone: Yup.string().required("Teléfono es requerido"),
  email: Yup.string()
    .email("Correo electrónico inválido")
    .required("Correo electrónico es requerido"),
  economicActivity: Yup.string().required("Seleccione la actividad económica")
});

export interface IDocument {
  id: number;
  name: string;
  templateUrl: string;
  documentType: string;
  validity: string | null;
  subjectTypeId: string;
  subjectSubtypeId: string | null;
  documentTypeId: number;
  isMandatory: number;
  isAvailable: number;
  url: string | null;
  statusName: string;
  statusColor: string;
  statusId: string;
}
