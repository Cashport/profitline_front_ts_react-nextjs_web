import React, { useEffect, useState } from "react";
import { Modal, Button, Checkbox, Flex } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useTranslations } from "use-intl";
import "./resolvenoveltymodal.scss";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import { CaretRight } from "phosphor-react";
import { IIncidentDetail } from "@/hooks/useNoveltyDetail";
import { SelectNoveltyNode } from "../SelectNoveltyNote/SelectNoveltyNode";
import { MessageInstance } from "antd/es/message/interface";
import { ApplyNoveltyModal } from "../ApplyNoveltyModal/ApplyNoveltyModal";
import { useAppStore } from "@/lib/store/store";
interface ResolveNoveltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onResolve: (data: { file?: File; comment: string }) => void;
  isResolving: boolean;
  novelty: IIncidentDetail;
  messageApi: MessageInstance;
}

interface infoObject {
  file: File;
  fileList: File[];
}

const ResolveNoveltyModal: React.FC<ResolveNoveltyModalProps> = ({
  isOpen,
  onClose,
  onResolve,
  isResolving,
  novelty,
  messageApi
}) => {
  const t = useTranslations("modals.resolveNovelty");
  const tShared = useTranslations("modals.shared");
  const tCommon = useTranslations("common");
  const { ID } = useAppStore((state) => state.selectedProject);
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [isAccountingAdjustment, setIsAccountingAdjustment] = useState(false);
  const [currentView, setCurrentView] = useState<string>("info");
  const [adjustmentType, setAdjustmentType] = useState<string>("");
  const [selectedNotes, setSelectedNotes] = useState<any[]>([]);

  const handleFileChange: any = (info: infoObject) => {
    const { file: rawFile } = info;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        return;
      }
      setFile(rawFile);
    }
  };
  const handleFileDelete = () => {
    setFile(null);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleResolve = () => {
    if (isAccountingAdjustment) {
      setCurrentView("selectAdjust");
    } else {
      onResolve({
        file: file || undefined,
        comment
      });
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setComment("");
      setIsAccountingAdjustment(false);
    }
  }, [isOpen]);

  const handleAdjustmentTypeSelect = (type: string) => {
    setAdjustmentType(type);
    setCurrentView("selectNote");
  };

  const getModalHeader = () => {
    const goBack = () => {
      switch (currentView) {
        case "selectAdjust":
          setCurrentView("info");
          break;
        case "selectNote":
          setCurrentView("selectAdjust");
          break;
        case "apply":
          setCurrentView("selectNote");
          break;
        default:
          onClose();
      }
    };

    let title = isResolving ? t("titleResolve") : t("titleReject");
    switch (currentView) {
      case "selectAdjust":
        title = t("titleAdjustment");
        break;
      case "selectNote":
        title = titleApplyMap[Number(adjustmentType)]
          ? t(titleApplyMap[Number(adjustmentType)])
          : "";
        break;
      case "apply":
        title = t("titleApply");
        break;
    }

    return (
      <div className="modal-header">
        <Button icon={<LeftOutlined />} type="text" onClick={goBack} />
        <span>{title}</span>
      </div>
    );
  };
  useEffect(() => {
    if (currentView === "selectAdjust") {
      setSelectedNotes([]);
    }
  }, [currentView]);

  const onCloseAll = () => {
    console.log("onCloseAll");
    setSelectedNotes([]);
    setCurrentView("info");
    setFile(null);
    onClose();
  };

  return (
    <Modal
      title={getModalHeader()}
      open={isOpen}
      onCancel={onCloseAll}
      footer={null}
      width={"40%"}
      style={{
        height: currentView === "selectNote" ? "calc(80 * var(--vh) - 20px)" : "auto",
        zIndex: 100000
      }}
      className="resolve-novelty-modal"
    >
      {currentView === "info" && (
        <div className="content">
          <p>{t("intro")}</p>
          <div className="upload-section">
            <Flex vertical>
              <label>{tCommon("fields.document")}</label>
              <small>{tShared("optional")}</small>
            </Flex>
            <DocumentButton
              title={tShared("attachment")}
              fileName={file ? file.name : tShared("selectFile")}
              fileSize={file ? file.size : tShared("fileHint30")}
              handleOnChange={handleFileChange}
              handleOnDelete={handleFileDelete}
            />
          </div>

          <div className="comment-section">
            <Flex vertical>
              <label>{tCommon("fields.comments")}</label>
              <small>{tShared("optional")}</small>
            </Flex>
            <textarea
              placeholder={tShared("commentPlaceholder")}
              value={comment}
              onChange={handleCommentChange}
            />
          </div>
          {isResolving && (
            <Checkbox
              checked={isAccountingAdjustment}
              onChange={(e) => setIsAccountingAdjustment(e.target.checked)}
            >
              {t("generatedAdjustment")}
            </Checkbox>
          )}
          <div className="footer">
            <Button onClick={onCloseAll}>{tCommon("actions.cancel")}</Button>
            <Button type="primary" onClick={handleResolve}>
              {isResolving ? t("resolve") : tCommon("actions.reject")}
            </Button>
          </div>
        </div>
      )}
      {currentView === "selectAdjust" && (
        <div className="content">
          <p>{t("selectAdjustmentType")}</p>
          <Flex vertical gap="small">
            <button className="actionButton" onClick={() => handleAdjustmentTypeSelect("2")}>
              <p className="actionButton__text">{tShared("creditMemo")}</p>
              <CaretRight className="actionButton__caretRight" />
            </button>
            <button className="actionButton" onClick={() => handleAdjustmentTypeSelect("1")}>
              <p className="actionButton__text">{tShared("debitMemo")}</p>
              <CaretRight className="actionButton__caretRight" />
            </button>
            <button className="actionButton" onClick={() => handleAdjustmentTypeSelect("3")}>
              <p className="actionButton__text">{tShared("discount")}</p>
              <CaretRight className="actionButton__caretRight" />
            </button>
          </Flex>
        </div>
      )}
      {currentView === "selectNote" && (
        <SelectNoveltyNode
          type={Number(adjustmentType)}
          selectedNotes={selectedNotes}
          setSelectedNotes={setSelectedNotes}
          onClose={() => setCurrentView("selectAdjust")}
          onContinue={() => setCurrentView("apply")}
          clientId={novelty.client_id} // TODO CAMBIAR ESTO
          projectId={ID} // TODO CAMBIAR ESTO
        />
      )}
      {currentView === "apply" && (
        <ApplyNoveltyModal
          type={Number(adjustmentType)}
          selectedRows={selectedNotes}
          setCurrentView={setCurrentView}
          invoiceSelected={[novelty]}
          messageApi={messageApi}
          onClosePrincipalModal={() => {
            onCloseAll();
          }}
          selectedEvidence={file}
          onResolve={onResolve}
        />
      )}
    </Modal>
  );
};
const titleApplyMap: Record<number, "selectDebitMemo" | "selectCreditMemo" | "selectDiscount"> = {
  1: "selectDebitMemo",
  2: "selectCreditMemo",
  3: "selectDiscount"
};

export default ResolveNoveltyModal;
