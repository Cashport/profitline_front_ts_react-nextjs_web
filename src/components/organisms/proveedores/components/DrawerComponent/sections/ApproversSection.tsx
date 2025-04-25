// sections/ApproversSection.tsx
import React from "react";
import { Flex } from "antd";
import { UsersThree } from "phosphor-react";
import ColumnText from "../../ColumnText/ColumnText";
import { IDocumentApprover } from "@/interfaces/Document";
import { getStatusDetails } from "../../../utils/documentStatusMap";
import { DotOutline } from "@phosphor-icons/react";

interface ApproversSectionProps {
  approvers: IDocumentApprover[]; // Lista de nombres de los aprobadores
}

const ApproversSection: React.FC<ApproversSectionProps> = ({ approvers }) => {
  return (
    <ColumnText
      title="Aprobadores"
      icon={<UsersThree size={16} color="#7B7B7B" />}
      content={
        <Flex align="center" gap={8} wrap>
          {approvers.map((approver, index) => {
            const { color, backgroundColor, icon, textWrapper } = getStatusDetails(
              approver.statusId,
              {
                fallbackName: approver.statusName,
                fallbackColor: approver.statusColor,
                iconSize: 14
              }
            );

            return (
              <div
                key={index}
                content={approver.approverName}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  backgroundColor: `${backgroundColor}`,
                  color: color,
                  borderRadius: "42px",
                  padding: "3px 10px",
                  paddingLeft: "6px"
                }}
              >
                {icon ?? <DotOutline size={24} color={color} weight="fill" />}
                {textWrapper ? textWrapper(approver.approverName) : approver.approverName}
              </div>
            );
          })}
        </Flex>
      }
    />
  );
};

export default ApproversSection;
