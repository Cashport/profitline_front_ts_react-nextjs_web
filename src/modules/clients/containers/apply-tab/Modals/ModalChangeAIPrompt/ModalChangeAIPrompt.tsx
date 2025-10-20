"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Flex, message, Modal, Skeleton, Typography } from "antd";
import { Sparkle } from "@phosphor-icons/react";
import { auth } from "../../../../../../../firebase";

import {
  createPrompt,
  getPromptByClientAndAITask,
  IPrompt,
  updatePrompt
} from "@/services/applyTabClients/applyTabClients";
import { useAppStore } from "@/lib/store/store";
import { extractSingleParam } from "@/utils/utils";
export const CLIENTUUID_DEMO = "903399c4062f4d49974d7187babc9acd";

import "./modalChangeAIPrompt.scss";
const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalChangeAIPrompt = ({ isOpen, onClose }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [promptData, setPromptData] = useState<IPrompt>();
  const [notFound, setNotFound] = useState(false);
  const [loadingReqRes, setLoadingReqRes] = useState({
    request: false,
    response: false
  });

  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || CLIENTUUID_DEMO;

  useEffect(() => {
    if (isOpen) {
      // 1 es aplicación de pagos
      (async () => {
        setLoadingReqRes((prev) => ({ ...prev, response: true }));
        try {
          const response = await getPromptByClientAndAITask(projectId, clientId, 1);

          if (response.data === null) {
            setNotFound(true);
            message.info("No se encontró un prompt para este cliente, por favor crea uno.");
            setLoadingReqRes((prev) => ({ ...prev, response: false }));
            return;
          }
          setPrompt(response?.data.prompt || "");
          setPromptData(response?.data);
        } catch (error) {
          message.error("Error al obtener el prompt del cliente");
        }
        setLoadingReqRes((prev) => ({ ...prev, response: false }));
      })();
    }

    return () => {
      setIsEditing(false);
      setPrompt("");
      setNotFound(false);
    };
  }, [isOpen]);

  const onSubmitPrompt = async () => {
    setLoadingReqRes((prev) => ({ ...prev, request: true }));
    // Si no existe el prompt entonces se crea
    if (notFound) {
      try {
        await createPrompt(projectId, clientId, 1, prompt);
        message.success("Prompt creado con éxito");
        onClose();
      } catch (error) {
        message.error("Error al crear el prompt");
      }
    } else {
      try {
        const currentUserEmail = auth.currentUser?.email || "";
        await updatePrompt(promptData?.id || 0, prompt, currentUserEmail);
        message.success("Prompt actualizado con éxito");
        onClose();
      } catch (error) {
        message.error("Error al actualizar el prompt");
      }
    }
    setLoadingReqRes((prev) => ({ ...prev, request: false }));
  };

  return (
    <Modal
      className="modalChangeAIPrompt"
      open={isOpen}
      centered
      title={
        <Title className="modalChangeAIPrompt__title" level={4}>
          Prompt de cliente para{" "}
          <span
            className="cashportIATextGradient"
            style={{
              fontWeight: 500
            }}
          >
            CashportAI
          </span>
        </Title>
      }
      footer={null}
      onCancel={onClose}
      width={800}
      destroyOnClose
    >
      <Flex vertical gap={"24px"}>
        <p className="modalChangeAIPrompt__description">
          Si el cliente tiene condiciones especiales{" "}
          <span
            className="cashportIATextGradient"
            style={{
              fontWeight: 500
            }}
          >
            CashportAI
          </span>{" "}
          los tendrá en cuenta en el proceso para la extracción de data
        </p>

        {loadingReqRes.response ? (
          <Skeleton active />
        ) : (
          <Flex vertical>
            <p className="modalChangeAIPrompt__label">Prompt</p>
            <textarea
              defaultValue={prompt}
              className="modalChangeAIPrompt__textArea"
              onChange={(e) => setPrompt(e.target.value)}
              disabled={!isEditing}
            />
          </Flex>
        )}

        <div className="modalChangeAIPrompt__footer">
          <Button className="cancelButton" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancelar edición" : "Editar"}
          </Button>
          <Button
            className="iaButton"
            onClick={onSubmitPrompt}
            loading={loadingReqRes.request}
            disabled={!isEditing || prompt.trim() === ""}
          >
            <Sparkle size={14} color="#5b21b6" weight="fill" />
            <span className="textNormal">
              Guardar{" "}
              <span
                className="cashportIATextGradient"
                style={{
                  fontWeight: 500
                }}
              >
                CashportAI
              </span>
            </span>
          </Button>
        </div>
      </Flex>
    </Modal>
  );
};
