"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Flex, message, Modal, Typography } from "antd";
import { Sparkle } from "@phosphor-icons/react";

import {
  createPrompt,
  getPromptByClientAndAITask
} from "@/services/applyTabClients/applyTabClients";
import { useAppStore } from "@/lib/store/store";
import { extractSingleParam } from "@/utils/utils";

import "./modalChangeAIPrompt.scss";
const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalChangeAIPrompt = ({ isOpen, onClose }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [notFound, setNotFound] = useState(false);

  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";

  useEffect(() => {
    if (isOpen) {
      // 1 es aplicación de pagos
      (async () => {
        try {
          const response = await getPromptByClientAndAITask(projectId, clientId, 1);

          if (response.status === 404) {
            setNotFound(true);
            message.info("No se encontró un prompt para este cliente, por favor crea uno.");
            return;
          }
          setPrompt(response?.data.prompt || "");
        } catch (error) {
          message.error("Error al obtener el prompt del cliente");
        }
      })();
    }

    return () => {
      setIsEditing(false);
      setPrompt("");
      setNotFound(false);
    };
  }, [isOpen]);

  const onSubmitPrompt = async () => {
    // Si no existe el prompt entonces se crea
    if (notFound) {
      try {
        await createPrompt(projectId, clientId, 1, prompt);
        message.success("Prompt creado con éxito");
      } catch (error) {
        message.error("Error al crear el prompt");
      }
    } else {
      // TO DO: Aca entonces lo editamos
    }
  };

  return (
    <Modal
      className="modalChangeAIPrompt"
      open={isOpen}
      centered
      title={
        <Title className="modalChangeAIPrompt__title" level={4}>
          Promtp de cliente para{" "}
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
      width={660}
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

        <Flex vertical>
          <p className="modalChangeAIPrompt__label">Prompt</p>
          <textarea
            defaultValue={prompt}
            className="modalChangeAIPrompt__textArea"
            onChange={(e) => setPrompt(e.target.value)}
            disabled={!isEditing}
          />
        </Flex>

        <div className="modalChangeAIPrompt__footer">
          <Button className="cancelButton" onClick={() => setIsEditing(!isEditing)}>
            Editar
          </Button>
          <Button className="iaButton" onClick={onSubmitPrompt}>
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
