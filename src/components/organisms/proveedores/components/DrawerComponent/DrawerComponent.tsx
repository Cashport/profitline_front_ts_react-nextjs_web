// DrawerComponent.tsx
import React from "react";
import { Drawer, Flex, Typography } from "antd";
import DescriptionSection from "./sections/DescriptionSection";
import ApproversSection from "./sections/ApproversSection";
import ExpirationSection from "./sections/ExpirationSection";
import EventsSection from "./sections/EventsSection";
import { ValiditySection } from "./sections/ValiditySection";
import { CaretDoubleRight, Files, ListChecks } from "phosphor-react";
import { Tag } from "@/components/atoms/Tag/Tag";
import IconButton from "@/components/atoms/IconButton/IconButton";
import { useDocument } from "@/hooks/useDocument";
import DocumentUploadSection from "./sections/DocumentUploadSection";
import ColumnText from "../ColumnText/ColumnText";

const { Title } = Typography;

interface DrawerProps {
  subjectId: string;
  documentId: number;
  visible: boolean;
  onClose: () => void;
  control: any;
  errors: any;
  type: "document" | "form";
}

const DrawerComponent: React.FC<DrawerProps> = ({
  subjectId,
  documentId,
  visible,
  onClose,
  control,
  errors,
  type
}) => {
  const { document, isLoading, mutate } = useDocument(subjectId, documentId);
  // console.log("subjectId", subjectId);
  // console.log("documentId", documentId);
  if (isLoading || !document) {
    return null;
  }

  return (
    <Drawer
      title={
        <Flex vertical justify="flex-start">
          <IconButton icon={<CaretDoubleRight size={20} />} onClick={onClose} />
          <Title style={{ marginTop: 20 }} level={4}>
            {document.documentTypeName}
          </Title>
          <Flex wrap>
            <Tag
              content={document.statusName}
              color={document.statusColor}
              style={{
                fontWeight: 400,
                fontSize: 14
              }}
            />
          </Flex>
          <hr style={{ borderTop: "1px solid #f7f7f7", marginTop: 20 }} />
        </Flex>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={644}
      closeIcon={false}
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <Flex gap={16} vertical>
        <DescriptionSection
          description={document.documentTypeDescription}
          uploadedBy={document.createdBy}
        />
        <ValiditySection validity={document.expiryDate} date={document.createdAt} />
        <ApproversSection approvers={document.approvers} />
        <hr style={{ borderTop: "1px solid #f7f7f7" }} />
        {type === "document" ? (
          <DocumentUploadSection
            documents={document.documents}
            templateUrl={document.templateUrl}
            subjectId={subjectId}
            documentId={document.id}
            mutate={mutate}
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
        <hr style={{ borderTop: "1px solid #f7f7f7" }} />
        <ExpirationSection
          subjectId={subjectId}
          documentTypeSubjectId={document.id}
          mutate={mutate}
          expirationDate={document.expiryDate}
        />
        <EventsSection events={[]} onAddComment={() => {}} />
      </Flex>
    </Drawer>
  );
};

export default DrawerComponent;
