import React, { Dispatch, SetStateAction, useState } from "react";
import { Flex, Spin, Typography } from "antd";
import { FileArrowUp, Pencil } from "phosphor-react";
import "./documentButtonAction.scss";
import { FileDownloadModal } from "@/components/molecules/modals/FileDownloadModal/FileDownloadModal";
import { editClientDocument } from "@/services/clients/clients";
import { useMessageApi } from "@/context/MessageContext";

const { Text } = Typography;

interface Props {
  className?: any;
  renderedDocument: { ID: number; URL: string };
  clientId: string;
  editable?: boolean;
  setDocumentReplaced?: Dispatch<SetStateAction<boolean>>;
}

export const DocumentButtonAction = ({
  className,
  renderedDocument,
  clientId,
  editable,
  setDocumentReplaced
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { ID: documentId, URL: documentUrl } = renderedDocument;
  const [loadingReplaceDocument, setLoadingReplaceDocument] = useState(false);
  const { showMessage } = useMessageApi();

  const handleDocumentClick = () => {
    const fileExtension = documentUrl?.trim().split(".").pop()?.toLowerCase() ?? "";
    if (["png", "jpg", "jpeg"].includes(fileExtension)) {
      if (isModalOpen === false) setIsModalOpen(true);
    } else {
      window.open(documentUrl, "_blank");
    }
  };

  const handleReplaceDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editable) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*, application/pdf";
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        setLoadingReplaceDocument(true);
        await editClientDocument({ clientId, documentId, file, showMessage });
        setLoadingReplaceDocument(false);
        if (setDocumentReplaced) setDocumentReplaced(true);
      };
      input.click();
    }
  };

  return (
    <div
      className={className ? `documentDragger ${className}` : "documentDragger"}
      onClick={handleDocumentClick}
    >
      {loadingReplaceDocument ? (
        <Flex align="center" justify="center" style={{ marginTop: "0.8rem" }}>
          <Spin />
        </Flex>
      ) : (
        <>
          <div className="nameIconContainer">
            <FileArrowUp size={"25px"} style={{ minWidth: "18px" }} />
            <p className="nameFile">
              {documentUrl ? documentUrl.split("/").pop() : "Seleccionar archivo"}
            </p>
          </div>

          {editable && (
            <Pencil onClick={handleReplaceDocument} className="editButton" size={"1.5rem"} />
          )}
        </>
      )}

      <FileDownloadModal
        isModalOpen={isModalOpen}
        onCloseModal={setIsModalOpen}
        url={documentUrl ?? ""}
      />
    </div>
  );
};
