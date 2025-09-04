"use client";
import { useState } from "react";
import { Button, Flex, Modal, Typography } from "antd";
import { Sparkle } from "@phosphor-icons/react";

import "./modalChangeAIPrompt.scss";
const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalChangeAIPrompt = ({ isOpen, onClose }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [availableTags] = useState([
    { id: "tag1", content: "IMPORTANTE" },
    { id: "tag2", content: "URGENTE" },
    { id: "tag3", content: "REVISAR" },
    { id: "tag4", content: "NOTA" }
  ]);
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
    >
      <Flex vertical gap={"24px"}>
        <p className="modalChangeAIPrompt__description">
          Si el cliente tiene condiciones especiales y CashportAI los tendré en cuenta en el proceso
          para la extracción de data
        </p>

        <textarea name="" id=""></textarea>

        <Flex gap={"12px"} align="center">
          <p>Tags:</p>
          <Flex gap={"5px"} wrap>
            {availableTags.map((tag) => (
              <span key={tag.id} className="modalChangeAIPrompt__tag">
                {tag.content}
              </span>
            ))}
          </Flex>
        </Flex>

        <div className="modalChangeAIPrompt__footer">
          <Button className="cancelButton" onClick={() => setIsEditing(!isEditing)}>
            Editar
          </Button>
          <Button className="iaButton">
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
