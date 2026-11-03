import IconButton from "@/components/atoms/IconButton/IconButton";
import { formatDate } from "@/utils/utils";
import type { ColumnType } from "antd/es/table";
import type { useTranslations } from "use-intl";
import { Eye } from "phosphor-react";
import { Document } from "./types";
import BadgeDocumentStatus from "../components/BadgeDocumentStatus/BadgeDocumentStatus";

type DocumentsT = ReturnType<typeof useTranslations<"suppliers.documentsTable">>;
type CommonT = ReturnType<typeof useTranslations<"common">>;

export const columns = ({
  handleOpenDrawer,
  setSelectedDocument,
  t,
  tCommon
}: {
  handleOpenDrawer: () => void;
  setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>;
  t: DocumentsT;
  tCommon: CommonT;
}) => [
  { title: tCommon("fields.name"), dataIndex: "name", key: "name", width: "20%" },
  {
    title: tCommon("fields.description"),
    dataIndex: "description",
    key: "description",
    width: "35%"
  },
  {
    title: t("uploadDate"),
    dataIndex: "createdAt",
    key: "createdAt",
    render: (_: string, record: any) => {
      if (record.createdAt) {
        return formatDate(record.createdAt);
      }
      return "-";
    },
    width: "15%"
  },
  {
    title: t("expiration"),
    dataIndex: "expiryDate",
    key: "expiryDate",
    render: (_: string, record: any) => {
      if (record.expiryDate) {
        return formatDate(record.expiryDate);
      }
      return "-";
    },
    width: "15%"
  },
  {
    title: t("mandatory"),
    dataIndex: "isMandatory",
    key: "isMandatory",
    render: (isMandatory: boolean) => (
      <p>{isMandatory ? tCommon("status.yes") : tCommon("status.no")}</p>
    ),
    width: "10%"
  },
  {
    title: tCommon("fields.status"),
    dataIndex: "statusId",
    key: "statusId",
    render: (statusId: string) => {
      return <BadgeDocumentStatus statusId={statusId} />;
    }
  },
  {
    title: "",
    dataIndex: "seeMore",
    key: "seeMore",
    render: (_: any, record: any) => (
      <IconButton
        onClick={() => {
          setSelectedDocument(record);
          handleOpenDrawer();
        }}
        icon={<Eye size={"1.3rem"} />}
        aria-label={t("viewDetail")}
        style={{ backgroundColor: "#F4F4F4" }}
      />
    ),
    align: "right" as ColumnType<Document>["align"]
  }
];
