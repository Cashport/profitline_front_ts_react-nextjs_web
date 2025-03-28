import IconButton from "@/components/atoms/IconButton/IconButton";
import { Tag } from "@/components/atoms/Tag/Tag";
import { formatDate } from "@/utils/utils";
import { Flex } from "antd";
import type { ColumnType } from "antd/es/table";
import { Eye } from "phosphor-react";
import { Document } from "./types";

export const columns = ({
  handleOpenDrawer,
  setSelectedDocument
}: {
  handleOpenDrawer: () => void;
  setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>;
}) => [
  { title: "Nombre", dataIndex: "name", key: "name", width: "20%" },
  {
    title: "Descripción",
    dataIndex: "description",
    key: "description",
    width: "35%"
  },
  {
    title: "Fecha cargue",
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
    title: "Vencimiento",
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
    title: "Estado",
    dataIndex: "status",
    key: "status",
    render: (_: string, record: any) => (
      <Flex>
        <Tag
          color={record.statusColor}
          content={record.statusName}
          style={{ fontSize: 14, fontWeight: 400 }}
        />
      </Flex>
    ),
    width: "15%"
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
        style={{ backgroundColor: "#F4F4F4" }}
      />
    ),
    align: "right" as ColumnType<Document>["align"]
  }
];
