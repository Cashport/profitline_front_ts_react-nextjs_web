"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Flex, message, Modal, Skeleton, Typography } from "antd";
import { Sparkle } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { auth } from "../../../../../../../firebase";

import {
  createPrompt,
  getPromptByClientAndAITask,
  IPrompt,
  updatePrompt
} from "@/services/applyTabClients/applyTabClients";
import { useAppStore } from "@/lib/store/store";
import { extractSingleParam } from "@/utils/utils";

import "./modalChangeAIPrompt.scss";
import { CLIENTUUID_DEMO } from "@/utils/constants/globalConstants";
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
  const t = useTranslations("clients.applyModals.changePrompt");
  const tCommon = useTranslations("common");
  const aiText = (chunks: React.ReactNode) => (
    <span className="cashportIATextGradient" style={{ fontWeight: 500 }}>
      {chunks}
    </span>
  );

  useEffect(() => {
    if (isOpen) {
      // 1 es aplicación de pagos
      (async () => {
        setLoadingReqRes((prev) => ({ ...prev, response: true }));
        try {
          const response = await getPromptByClientAndAITask(projectId, clientId, 1);

          if (response.data === null) {
            setNotFound(true);
            message.info(t("notFound"));
            setLoadingReqRes((prev) => ({ ...prev, response: false }));
            return;
          }
          setPrompt(response?.data.prompt || "");
          setPromptData(response?.data);
        } catch (error) {
          message.error(t("loadError"));
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
        message.success(t("created"));
        onClose();
      } catch (error) {
        message.error(t("createError"));
      }
    } else {
      try {
        const currentUserEmail = auth.currentUser?.email || "";
        await updatePrompt(promptData?.id || 0, prompt, currentUserEmail);
        message.success(t("updated"));
        onClose();
      } catch (error) {
        message.error(t("updateError"));
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
          {t.rich("title", { ai: aiText })}
        </Title>
      }
      footer={null}
      onCancel={onClose}
      width={800}
      destroyOnClose
    >
      <Flex vertical gap={"24px"}>
        <p className="modalChangeAIPrompt__description">{t.rich("description", { ai: aiText })}</p>

        {loadingReqRes.response ? (
          <Skeleton active />
        ) : (
          <Flex vertical>
            <p className="modalChangeAIPrompt__label">{t("label")}</p>
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
            {isEditing ? t("cancelEdit") : tCommon("actions.edit")}
          </Button>
          <Button
            className="iaButton"
            onClick={onSubmitPrompt}
            loading={loadingReqRes.request}
            disabled={!isEditing || prompt.trim() === ""}
          >
            <Sparkle size={14} color="#5b21b6" weight="fill" />
            <span className="textNormal">{t.rich("save", { ai: aiText })}</span>
          </Button>
        </div>
      </Flex>
    </Modal>
  );
};
