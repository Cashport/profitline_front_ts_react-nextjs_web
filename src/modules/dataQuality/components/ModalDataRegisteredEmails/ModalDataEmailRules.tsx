import React, { useEffect, useState } from "react";
import { Modal, Spin, Input, message } from "antd";
import { Trash, Plus, X } from "@phosphor-icons/react";

import {
  getClientDataEmails,
  addClientDataEmail,
  deleteClientDataEmail,
  getClientAiContext,
  editClientPrompt
} from "@/services/dataQuality/dataQuality";
import { isValidEmail } from "@/modules/commerce/utils/constants/checkout";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { IDataEmail } from "@/types/dataQuality/IDataQuality";

import "./modalDataEmailRules.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
}

export const ModalDataEmailRules: React.FC<Props> = ({ isOpen, onClose, clientId }) => {
  const [existingEmails, setExistingEmails] = useState<IDataEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newEmails, setNewEmails] = useState<string[]>([]);
  const [aiContext, setAiContext] = useState("");
  const [initialAiContext, setInitialAiContext] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchEmails = async () => {
    try {
      const rules = await getClientDataEmails(clientId);
      setExistingEmails(rules);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al obtener los correos registrados"
      );
    }
  };

  const fetchAiContext = async () => {
    try {
      const { ai_context } = await getClientAiContext(clientId);
      setAiContext(ai_context || "");
      setInitialAiContext(ai_context || "");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al obtener el prompt");
    }
  };

  const fetchInitialData = async () => {
    setIsLoading(true);
    await Promise.all([fetchEmails(), fetchAiContext()]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      setNewEmails([]);
      setAiContext("");
      setInitialAiContext("");
      fetchInitialData();
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
    const hasNewEmails = nonEmpty.length > 0;
    const promptChanged = aiContext !== initialAiContext;

    if (!hasNewEmails && !promptChanged) return;
    if (hasNewEmails && !nonEmpty.every((email) => isValidEmail(email))) {
      message.error("Ingresa correos válidos");
      return;
    }

    setIsSaving(true);
    const hide = message.loading("Guardando...", 0);
    try {
      if (hasNewEmails) {
        try {
          await addClientDataEmail(nonEmpty.map((sender) => ({ client_id: clientId, sender })));
          message.success("Correos guardados exitosamente");
          setNewEmails([]);
          await fetchEmails();
        } catch (error) {
          message.error(
            error instanceof Error
              ? `Error al guardar los correos: ${error.message}`
              : "Error al guardar los correos"
          );
        }
      }
      if (promptChanged) {
        try {
          await editClientPrompt(clientId, aiContext);
          message.success("Prompt actualizado exitosamente");
          setInitialAiContext(aiContext);
        } catch (error) {
          message.error(
            error instanceof Error
              ? `Error al actualizar el prompt: ${error.message}`
              : "Error al actualizar el prompt"
          );
        }
      }
    } finally {
      hide();
      setIsSaving(false);
    }
  };

  const nonEmptyEmails = newEmails.filter((email) => email.trim().length > 0);
  const hasNonEmpty = nonEmptyEmails.length > 0;
  const allValid = nonEmptyEmails.every((email) => isValidEmail(email));
  const promptChanged = aiContext !== initialAiContext;
  const hasSomethingToSave = hasNonEmpty || promptChanged;
  const emailsInvalid = hasNonEmpty && !allValid;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onClose={onClose}
      title="Editar reglas de correo"
      footer={null}
      centered
      destroyOnClose
      className="modalDataEmailRules"
    >
      <div className="modalDataEmailRules__content">
        {isLoading ? (
          <div className="modalDataEmailRules__loader">
            <Spin />
          </div>
        ) : (
          <div className="modalDataEmailRules__list">
            <div className="modalDataEmailRules__promptField">
              <p className="modalDataEmailRules__label">Prompt</p>
              <Input.TextArea
                value={aiContext}
                autoSize={{ minRows: 3, maxRows: 8 }}
                onChange={(e) => setAiContext(e.target.value)}
              />
            </div>

            {existingEmails.length === 0 && newEmails.length === 0 && (
              <p className="modalDataEmailRules__empty">No hay correos registrados.</p>
            )}

            {existingEmails.map((rule) => (
              <div key={rule.id} className="modalDataEmailRules__row">
                <span className="modalDataEmailRules__email">{rule.sender}</span>
                <button
                  type="button"
                  className="modalDataEmailRules__iconButton"
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
                <div key={`new-${index}`} className="modalDataEmailRules__newItem">
                  <div className="modalDataEmailRules__row">
                    <div className="modalDataEmailRules__field">
                      <Input
                        value={email}
                        placeholder="correo@ejemplo.com"
                        status={isInvalid ? "error" : undefined}
                        onChange={(e) => handleChangeNewEmail(index, e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="modalDataEmailRules__iconButton"
                      onClick={() => handleRemoveNewRow(index)}
                      aria-label="Quitar correo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {isInvalid && <p className="modalDataEmailRules__error">Correo no válido</p>}
                </div>
              );
            })}

            <button type="button" className="modalDataEmailRules__addButton" onClick={handleAddRow}>
              <Plus size={18} />
              Agregar correo
            </button>
          </div>
        )}

        <div className="modalDataEmailRules__footer">
          <PrincipalButton
            onClick={handleSave}
            loading={isSaving}
            disabled={!hasSomethingToSave || emailsInvalid || isSaving}
          >
            Guardar
          </PrincipalButton>
        </div>
      </div>
    </Modal>
  );
};
