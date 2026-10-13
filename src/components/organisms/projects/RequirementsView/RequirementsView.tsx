import UiSearchInput from "@/components/ui/search-input";
import { Button, Flex, Table, Typography } from "antd";
import { DotsThree, Eye } from "phosphor-react";
import { useState } from "react";
import "./RequirementsView.scss";
import { TableProps } from "antd/lib/table";
import { ClientTypeView } from "./components/ClientTypeView";

export interface IClientType {
  id: number;
  type: string;
  description: string;
  require_payment: boolean;
  document_quantity: number;
  isActive: boolean;
}

const mockedData: IClientType[] = [
  {
    id: 1,
    type: "Tipo 1",
    description: "Descripción 1",
    require_payment: true,
    document_quantity: 1,
    isActive: true
  },
  {
    id: 2,
    type: "Tipo 2",
    description: "Descripción 2",
    require_payment: false,
    document_quantity: 2,
    isActive: false
  },
  {
    id: 3,
    type: "Tipo 3",
    description: "Descripción 3",
    require_payment: true,
    document_quantity: 3,
    isActive: true
  },
  {
    id: 4,
    type: "Tipo 4",
    description: "Descripción 4",
    require_payment: false,
    document_quantity: 4,
    isActive: false
  },
  {
    id: 5,
    type: "Tipo 5",
    description: "Descripción 5",
    require_payment: true,
    document_quantity: 5,
    isActive: true
  },
  {
    id: 6,
    type: "Tipo 6",
    description: "Descripción 6",
    require_payment: false,
    document_quantity: 6,
    isActive: false
  }
];
const { Text } = Typography;
export const RequirementsView = () => {
  const [isGenerateActionOpen, setIsGenerateActionOpen] = useState<boolean>(false);
  const [selectedClientType, setSelectedClientType] = useState<number | null>(null);

  const handleisGenerateActionOpen = () => {
    setIsGenerateActionOpen(!isGenerateActionOpen);
  };
  const columns: TableProps<IClientType>["columns"] = [
    {
      title: "Tipo",
      dataIndex: "type",
      key: "type"
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Requiere pago",
      dataIndex: "require_payment",
      key: "require_payment",
      render: (require_payment: boolean) => <Text>{require_payment ? "Si" : "No"}</Text>
    },
    {
      title: "Documentos",
      dataIndex: "document_quantity",
      key: "document_quantity"
    },
    {
      title: "Estado",
      key: "isActive",
      dataIndex: "isActive",
      render: (isActive: boolean) => (
        <Flex align="center" className={isActive ? "statusContainer" : "statusContainerPending"}>
          <div className={isActive ? "statusActive" : "statusPending"} />
          <Text>{isActive ? "Activo" : "Inactivo"}</Text>
        </Flex>
      )
    },
    {
      title: "",
      key: "seeProject",
      width: 110,
      dataIndex: "",
      render: (_, row) => (
        <Button
          onClick={() => {
            setSelectedClientType(row.id);
          }}
          icon={<Eye size={"1.3rem"} />}
        />
      )
    }
  ];
  if (selectedClientType !== null)
    return (
      <ClientTypeView
        selectedClientType={selectedClientType}
        goBack={() => setSelectedClientType(null)}
      />
    );
  return (
    <Flex vertical className="requirementsView" gap={"2rem"}>
      <Flex gap={"0.5rem"}>
        <UiSearchInput className="search" placeholder="Buscar" />
        <Button
          className="button__actions"
          size="large"
          icon={<DotsThree size={"1.5rem"} />}
          onClick={handleisGenerateActionOpen}
        >
          Generar acción
        </Button>
      </Flex>
      <Table dataSource={mockedData} columns={columns} rowKey="id" pagination={false} />
    </Flex>
  );
};
