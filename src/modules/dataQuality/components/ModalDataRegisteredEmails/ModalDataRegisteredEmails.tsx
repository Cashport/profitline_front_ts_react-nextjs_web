import React, { useEffect, useState } from "react";
import { Modal, Spin, Input, message } from "antd";
import { Trash, Plus, X } from "@phosphor-icons/react";

import {
  getClientDataEmails,
  addClientDataEmail,
  deleteClientDataEmail
} from "@/services/dataQuality/dataQuality";
import { isValidEmail } from "@/modules/commerce/utils/constants/checkout";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { IDataEmail } from "@/types/dataQuality/IDataQuality";

import "./modalDataRegisteredEmails.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
}

export const ModalDataRegisteredEmails: React.FC<Props> = ({ isOpen, onClose, clientId }) => {
  const [existingEmails, setExistingEmails] = useState<IDataEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newEmails, setNewEmails] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const rules = await getClientDataEmails(clientId);
      setExistingEmails(rules);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al obtener los correos registrados"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setNewEmails([]);
      fetchEmails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleDelete = async (rule: IDataEmail) => {
    const hide = message.loading("Eliminando correo...", 0);
    try {
      await deleteClientDataEmail([rule.id]);
      message.success("Correo eliminado exitosamente");
      setExistingEmails((prev) => prev.filter((email) => email.id !== rule.id));
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al eliminar el correo");
    } finally {
      hide();
    }
  };

  const handleAddRow = () => {
    setNewEmails((prev) => [...prev, ""]);
  };

  const handleChangeNewEmail = (index: number, value: string) => {
    setNewEmails((prev) => prev.map((email, i) => (i === index ? value : email)));
  };

  const handleRemoveNewRow = (index: number) => {
    setNewEmails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const nonEmpty = newEmails.map((email) => email.trim()).filter((email) => email.length > 0);

    if (nonEmpty.length === 0) return;
    if (!nonEmpty.every((email) => isValidEmail(email))) {
      message.error("Ingresa correos válidos");
      return;
    }

    setIsSaving(true);
    const hide = message.loading("Guardando correos...", 0);
    try {
      await addClientDataEmail(nonEmpty.map((sender) => ({ client_id: clientId, sender })));
      message.success("Correos guardados exitosamente");
      setNewEmails([]);
      await fetchEmails();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al guardar los correos");
    } finally {
      hide();
      setIsSaving(false);
    }
  };

  const nonEmptyEmails = newEmails.filter((email) => email.trim().length > 0);
  const hasNonEmpty = nonEmptyEmails.length > 0;
  const allValid = nonEmptyEmails.every((email) => isValidEmail(email));

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onClose={onClose}
      title="Remitentes"
      footer={null}
      centered
      destroyOnClose
      className="modalDataRegisteredEmails"
    >
      <div className="modalDataRegisteredEmails__content">
        {isLoading ? (
          <div className="modalDataRegisteredEmails__loader">
            <Spin />
          </div>
        ) : (
          <div className="modalDataRegisteredEmails__list">
            {existingEmails.length === 0 && newEmails.length === 0 && (
              <p className="modalDataRegisteredEmails__empty">No hay correos registrados.</p>
            )}

            {existingEmails.map((rule) => (
              <div key={rule.id} className="modalDataRegisteredEmails__row">
                <span className="modalDataRegisteredEmails__email">{rule.sender}</span>
                <button
                  type="button"
                  className="modalDataRegisteredEmails__iconButton"
                  onClick={() => handleDelete(rule)}
                  aria-label="Eliminar correo"
                >
                  <Trash size={18} />
                </button>
              </div>
            ))}

            {newEmails.map((email, index) => {
              const isInvalid = email.trim().length > 0 && !isValidEmail(email);
              return (
                <div key={`new-${index}`} className="modalDataRegisteredEmails__newItem">
                  <div className="modalDataRegisteredEmails__row">
                    <div className="modalDataRegisteredEmails__field">
                      <Input
                        value={email}
                        placeholder="correo@ejemplo.com"
                        status={isInvalid ? "error" : undefined}
                        onChange={(e) => handleChangeNewEmail(index, e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="modalDataRegisteredEmails__iconButton"
                      onClick={() => handleRemoveNewRow(index)}
                      aria-label="Quitar correo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {isInvalid && (
                    <p className="modalDataRegisteredEmails__error">Correo no válido</p>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              className="modalDataRegisteredEmails__addButton"
              onClick={handleAddRow}
            >
              <Plus size={18} />
              Agregar correo
            </button>
          </div>
        )}

        <div className="modalDataRegisteredEmails__footer">
          <PrincipalButton
            onClick={handleSave}
            loading={isSaving}
            disabled={!hasNonEmpty || !allValid || isSaving}
          >
            Guardar
          </PrincipalButton>
        </div>
      </div>
    </Modal>
  );
};
