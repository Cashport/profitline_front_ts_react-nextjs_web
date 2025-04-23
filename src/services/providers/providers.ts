import { API } from "@/utils/api/api";
import { IAuditTableRow } from "@/components/organisms/proveedores/components/ModalAuditRequirements/ModalAuditRequirements";

export const auditRequirements = async (documents: IAuditTableRow[]) => {
  try {
    const body = {
      documents: documents.map((doc) => ({
        documentTypeSubjectId: doc.id,
        accept: doc.audit?.toLowerCase() === "aprobar" ? true : false,
        comments: doc.commentary ?? ""
      }))
    };

    const response = await API.post("/subject/audit", body);
    return response;
  } catch (error) {
    console.error("Error al auditar requerimientos:", error);
    throw error;
  }
};
