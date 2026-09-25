import { Button, Flex, Table, Tooltip, Typography } from "antd";
import {
  ArrowsClockwise,
  CaretLeft,
  DotsThreeVertical,
  FileArrowDown,
  Pencil,
  Plus,
  WarningCircle
} from "phosphor-react";
import { useState } from "react";
import { TableProps } from "antd/lib/table";
import Link from "next/link";
import style from "./ClientTypeView.module.scss";
import { ModalAddRequirement } from "./ModalAddRequirement/ModalAddRequirement";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

export interface IClientRequirement {
  id: number;
  description: string;
  type: string;
  validity: string;
  template?: string;
  isMandatory: boolean;
  isActive: boolean;
  approvals_quantity: number;
}

const mockedData: IClientRequirement[] = [
  {
    id: 1,
    description: "Descripción",
    type: "Tipo",
    validity: "30 días",
    template: "Plantilla",
    isMandatory: true,
    isActive: true,
    approvals_quantity: 1
  },
  {
    id: 2,
    description: "Descripción",
    type: "Tipo",
    validity: "1 año",
    template: "Plantilla",
    isMandatory: true,
    isActive: false,
    approvals_quantity: 1
  },
  {
    id: 3,
    description: "Descripción",
    type: "Tipo",
    validity: "2 años",
    template: undefined,
    isMandatory: true,
    isActive: true,
    approvals_quantity: 1
  },
  {
    id: 4,
    description: "Descripción",
    type: "Tipo",
    validity: "Validez",
    template: "Plantilla",
    isMandatory: true,
    isActive: true,
    approvals_quantity: 1
  },
  {
    id: 5,
    description: "Descripción",
    type: "Tipo",
    validity: "Validez",
    template: "Plantilla",
    isMandatory: true,
    isActive: true,
    approvals_quantity: 1
  }
];

interface ClientTypeViewProps {
  selectedClientType: number | null;
  goBack: () => void;
}
const { Text } = Typography;

export const ClientTypeView = ({ selectedClientType, goBack }: ClientTypeViewProps) => {
  const [statusForm, setStatusForm] = useState<"edit" | "review">("review");
  const [isModalAddRequirementOpen, setIsModalAddRequirementOpen] = useState(false);
  const handleChangeStatusForm = (status: "edit" | "review") => {
    setStatusForm(status);
  };

  const columns: TableProps<IClientRequirement>["columns"] = [
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Tipo",
      dataIndex: "type",
      key: "type"
    },
    {
      title: "Vigencia",
      dataIndex: "validity",
      key: "validity"
    },
    {
      title: "Plantilla",
      dataIndex: "template",
      key: "template",
      render: (template: string) => {
        if (template?.length > 0) {
          return (
            <Link
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                textDecoration: "underline"
              }}
              href={`/requisitos/plantilla/${template}`}
            >
              Documento <FileArrowDown size={16} />
            </Link>
          );
        } else return <Text>-</Text>;
      }
    },
    {
      title: "Obligatorio",
      dataIndex: "isMandatory",
      key: "isMandatory",
      render: (isMandatory: boolean) => <Text>{isMandatory ? "Si" : "No"}</Text>
    },
    {
      title: "Estado",
      key: "isActive",
      dataIndex: "isActive",
      render: (isActive: boolean) => (
        <Flex
          align="center"
          className={isActive ? style.statusContainer : style.statusContainerPending}
        >
          <div className={isActive ? style.statusActive : style.statusPending} />
          <Text>{isActive ? "Activo" : "Inactivo"}</Text>
        </Flex>
      )
    },
    {
      title: "Aprobaciones",
      dataIndex: "approvals_quantity",
      key: "approvals_quantity",
      render: (approvals_quantity: number) => (
        <Tooltip
          color="#F7F7F7"
          title={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                padding: "16px",
                color: "black"
              }}
            >
              <p>Daniel Saenz - Gerente Comercial</p>
              <p>O</p>
              <p>Maria Osorio - Analista Financiero</p>
            </div>
          }
        >
          <Flex align="center" gap={4}>
            <Text>{approvals_quantity}</Text>
            <WarningCircle size={16} />
          </Flex>
        </Tooltip>
      )
    },
    {
      title: "",
      key: "actions",
      dataIndex: "actions",

      render: (_text, _record) => (
        <Tooltip
          color="#FFFFFF"
          placement="bottom"
          title={
            <Flex vertical gap="0.75rem" style={{ width: "242px", padding: "8px" }}>
              <ButtonGenerateAction
                onClick={() => {}}
                icon={<Pencil size={20} />}
                title="Editar"
                hideArrow
              />
              <ButtonGenerateAction
                icon={<ArrowsClockwise size={16} />}
                title="Inactivar"
                onClick={() => {}}
                hideArrow
              />
            </Flex>
          }
        >
          <Button
            style={{
              backgroundColor: "#F7F7F7",
              border: "none",
              boxShadow: "none"
            }}
            onClick={() => {}}
            icon={<DotsThreeVertical size={20} />}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <Flex vertical className={style.clientRequirementView} gap={"2rem"}>
      <Flex gap={"0.5rem"} justify="space-between" align="center">
        <Button
          onClick={goBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            border: "none",
            boxShadow: "none"
          }}
        >
          <CaretLeft size={20} />
          <span style={{ fontWeight: "600", fontSize: "16px" }}>
            {"Cliente proveedor industrial"}
          </span>
        </Button>

        <Button
          className={statusForm === "review" ? style.buttonEdit : style.buttonSave}
          htmlType="button"
          onClick={(e) => {
            e.preventDefault();
            handleChangeStatusForm(statusForm === "review" ? "edit" : "review");
          }}
        >
          {statusForm === "review" ? "Editar" : "Guardar"}
          <Pencil size={20} />
        </Button>
      </Flex>
      <Table
        dataSource={mockedData}
        columns={columns}
        rowKey="id"
        pagination={false}
        summary={
          statusForm === "edit"
            ? () => (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={columns.length} index={0}>
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        boxShadow: "none",
                        color: "black",
                        padding: "0",
                        fontWeight: "500"
                      }}
                      onClick={() => setIsModalAddRequirementOpen(true)}
                      icon={<Plus size={16} />}
                    >
                      Agregar requerimiento
                    </Button>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )
            : undefined
        }
      />
      <ModalAddRequirement
        isOpen={isModalAddRequirementOpen}
        onClose={() => setIsModalAddRequirementOpen(false)}
        selectedClientType={selectedClientType}
      />
    </Flex>
  );
};
