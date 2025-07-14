import React, { useEffect, useState } from "react";
import { message, Modal } from "antd";
import { CaretLeft } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { addCommentHistoricAction } from "@/services/accountingAdjustment/accountingAdjustment";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import "./modalEnterProcess.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
}

const ModalEnterProcess: React.FC<Props> = ({ isOpen, onClose, clientId }) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const [observations, setObservations] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setObservations("");
    }
  }, [isOpen]);

  // Manejo del submit
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addCommentHistoricAction(clientId || "", projectId, observations);

      message.success("Gestión ingresada correctamente.");
      onClose();
    } catch (error) {
      message.error("Error al ingresar la gestión. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  return (
    <Modal
      className="modalEnterProcess"
      width="50%"
      open={isOpen}
      footer={null}
      closable={false}
      destroyOnClose
    >
      <button className="modalEnterProcess__goBackBtn" onClick={onClose}>
        <CaretLeft size="1.25rem" />
        Ingresar gestión
      </button>

      <div className="modalEnterProcess__textArea">
        <p className="modalEnterProcess__textArea__label">Observación</p>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder=""
          className="modalEnterProcess__textArea__input"
        />
      </div>

      <FooterButtons
        handleOk={handleSubmit}
        onClose={onClose}
        titleConfirm="Ingresar gestión"
        isConfirmDisabled={!observations.trim()}
        isConfirmLoading={loading}
      />
    </Modal>
  );
};

export default ModalEnterProcess;
