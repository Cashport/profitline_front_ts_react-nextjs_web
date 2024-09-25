import { FC, useEffect, useState } from "react";
import { CaretDoubleRight, Check, X } from "phosphor-react";
import "./moldalnoveltydetail.scss";
import { Button, message, Typography } from "antd";
import { InfoSection } from "./components/infoSection/InfoSection";
import { InfoInvoice } from "./components/infoInvoice/InfoInvoice";
import { EvidenceSection } from "./components/EvidenceSection/EvidenceSection";
import { EventSection } from "./components/EventSection/EventSection";
import { IIncidentDetail, useIncidentDetail } from "@/hooks/useNoveltyDetail";
import ResolveNoveltyModal from "../ResolveNoveltyModal/ResolveNoveltyModal";
import { approveIncident, rejectIncident } from "@/services/resolveNovelty/resolveNovelty";
const { Title } = Typography;

interface MoldalNoveltyDetailProps {
  isOpen: boolean;
  onClose: () => void;
  noveltyId: number;
}

const MoldalNoveltyDetail: FC<MoldalNoveltyDetailProps> = ({ onClose, noveltyId }) => {
  const { data, isLoading, mutate: mutateIncident } = useIncidentDetail({ incidentId: noveltyId }); // TODO CAMBIAR ESTO
  const [incidentData, setIncidentData] = useState<IIncidentDetail | null>(null);
  const [openResolveModal, setOpenResolveModal] = useState(false);
  const [isResolving, setIsResolving] = useState(true);

  const [messageShow, contextHolder] = message.useMessage();
  useEffect(() => {
    if (data && data.length > 0) {
      setIncidentData(data[0]);
    }
  }, [data]);

  const handleOpenResolveModal = (isResolving: boolean) => {
    setIsResolving(isResolving);
    setOpenResolveModal(true);
  };

  const handleResolveNovelty = async (data: { file?: File; comment: string }) => {
    if (!incidentData) return;

    const actionData = {
      comments: data.comment,
      files: data.file ? [data.file] : undefined
    };

    try {
      if (isResolving) {
        await approveIncident(incidentData.invoice_id, noveltyId, actionData); // TODO CAMBIAR ESTO
        messageShow.success("Incidente aprobado exitosamente");
      } else {
        await rejectIncident(incidentData.invoice_id, noveltyId, actionData); // TODO CAMBIAR ESTO
        messageShow.success("Incidente rechazado exitosamente");
      }
      setOpenResolveModal(false);
      mutateIncident();
      onClose(); // Cierra el modal principal después de resolver/rechazar
    } catch (error) {
      console.error("Error al procesar el incidente:", error);
      messageShow.error("Hubo un error al procesar el incidente. Por favor, inténtalo de nuevo.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!incidentData) {
    return <div></div>;
  }

  return (
    <aside className={`wrapper__new  wrapper__new_hide`}>
      {contextHolder}
      <div>
        <div className="modalTopSide">
          <button type="button" className="back" onClick={onClose}>
            <CaretDoubleRight />
          </button>
        </div>

        <div className="header">
          <Title level={4}>{incidentData.incident_name}</Title>
          {incidentData.is_rejected !== 1 && incidentData.is_rejected !== 0 && (
            <div className="header-buttons">
              <Button onClick={() => handleOpenResolveModal(false)}>
                <X />
                Rechazar
              </Button>
              <Button type="primary" onClick={() => handleOpenResolveModal(true)}>
                <Check />
                Resolver
              </Button>
            </div>
          )}
        </div>
      </div>
      <InfoSection
        responsable={incidentData.responsible_user}
        fecha={incidentData.date}
        cliente={incidentData.client}
        aprobadores={[{ nombre: incidentData.approvers_users, estado: "pendiente" }]}
      />
      <InfoInvoice
        FacturaID={incidentData.id_erp || ""}
        invoice_amount_difference={incidentData.invoice_amount_difference || 0}
        invoice_cashport_value={incidentData.invoice_cashport_value}
        invoice_client_value={incidentData.invoice_client_value}
      />
      <EvidenceSection
        evidenceComments={incidentData.evidence_comments}
        evidenceFiles={incidentData.evidence_files}
      />
      <EventSection
        events={incidentData.events}
        incidentId={incidentData.incident_id.toString()}
        messageApi={messageShow}
        mutate={() => mutateIncident()}
        currentUserAvatar="/path/to/current/user/avatar.jpg"
      />
      <ResolveNoveltyModal
        isOpen={openResolveModal}
        onClose={() => setOpenResolveModal(false)}
        onResolve={handleResolveNovelty}
        isResolving={isResolving}
        novelty={incidentData}
        messageApi={messageShow}
      />
    </aside>
  );
};

export default MoldalNoveltyDetail;
