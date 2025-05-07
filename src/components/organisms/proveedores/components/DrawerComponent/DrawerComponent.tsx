// DrawerComponent.tsx
import React, { useEffect } from "react";
import { Drawer, Flex, Typography } from "antd";
import { DotOutline } from "@phosphor-icons/react";
import { CaretDoubleRight, Files, ListChecks } from "phosphor-react";

import { getStatusDetails } from "../../utils/documentStatusMap";
import { useDocument } from "@/hooks/useDocument";

import DescriptionSection from "./sections/DescriptionSection";
import ApproversSection from "./sections/ApproversSection";
import ExpirationSection from "./sections/ExpirationSection";
import { ValiditySection } from "./sections/ValiditySection";
import DocumentUploadSection from "./sections/DocumentUploadSection";
import ColumnText from "../ColumnText/ColumnText";
import { EventSection } from "./sections/EventSection";
import FooterSection from "./sections/FooterSection";

import "./drawerComponent.scss";
const { Title } = Typography;

interface DrawerProps {
  subjectId: string;
  documentId: number;
  visible: boolean;
  onClose: () => void;
  control: any;
  errors: any;
  type: "document" | "form";
  mutateSupplierInfo: () => void;
}

const DrawerComponent: React.FC<DrawerProps> = ({
  subjectId,
  documentId,
  visible,
  onClose,
  control,
  errors,
  type,
  mutateSupplierInfo
}) => {
  const { document, isLoading, mutate } = useDocument(subjectId, documentId);
  useEffect(() => {
    if (visible) {
      mutate();
    }
  }, [visible, mutate]);

  if (isLoading || !document) {
    return null;
  }

  const { color, backgroundColor } = getStatusDetails(document.statusId);

  return (
    <Drawer
      title={
        <Flex vertical justify="flex-start">
          <Flex gap={8} align="center">
            <button type="button" className="backButton" onClick={onClose}>
              <CaretDoubleRight />
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontWeight: 500,
                fontSize: "0.75rem",
                backgroundColor: `${backgroundColor}`,
                color: color,
                borderRadius: "42px",
                padding: "3px 2px",
                paddingRight: "10px",
                width: "fit-content"
              }}
            >
              <DotOutline size={24} color={color} weight="fill" />
              {document.statusName}
            </div>
          </Flex>
          <Title style={{ marginTop: 20 }} level={4}>
            {document?.documentTypeName}
          </Title>

          <hr style={{ borderTop: "1px solid #f7f7f7", marginTop: 14 }} />
        </Flex>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={644}
      closeIcon={false}
      style={{ backgroundColor: "#FFFFFF" }}
      footer={<FooterSection />}
      className="drawerComponentProviders"
      mask={false}
    >
      <Flex gap={8} vertical>
        <DescriptionSection
          description={document.documentTypeDescription}
          uploadedBy={document.createdBy}
        />
        <ValiditySection validity={document.expiryDate} date={document.createdAt} />
        <ApproversSection approvers={document.approvers} />
        <hr style={{ borderTop: "1px solid #f7f7f7", margin: " 8px 0" }} />
        {type === "document" ? (
          <DocumentUploadSection
            documents={document.documents}
            templateUrl={document.templateUrl}
            subjectId={subjectId}
            documentId={document.id}
            mutate={mutate}
            mutateSupplierInfo={mutateSupplierInfo}
          />
        ) : (
          <ColumnText
            title="Formulario"
            icon={<Files size={16} color="#7B7B7B" />}
            content={
              <Flex
                vertical
                align="center"
                style={{
                  width: "100%",
                  backgroundColor: "#F7F7F7",
                  padding: 16,
                  cursor: "pointer"
                }}
              >
                <ListChecks size={16} color="#7B7B7B" />
                <Typography.Text style={{ fontSize: 16, fontWeight: 400 }}>
                  Formulario
                </Typography.Text>
                <Typography.Text style={{ fontSize: 10, fontWeight: 300 }}>
                  10 Preguntas
                </Typography.Text>
              </Flex>
            }
          />
        )}
        <hr style={{ borderTop: "1px solid #f7f7f7", margin: " 8px 0" }} />
        <ExpirationSection
          subjectId={subjectId}
          documentTypeSubjectId={document.id}
          mutate={mutate}
          mutateSupplierInfo={mutateSupplierInfo}
          expirationDate={document.expiryDate}
        />
        <hr style={{ borderTop: "1px solid #f7f7f7", margin: " 8px 0" }} />
        <EventSection />
      </Flex>
    </Drawer>
  );
};

export default DrawerComponent;
