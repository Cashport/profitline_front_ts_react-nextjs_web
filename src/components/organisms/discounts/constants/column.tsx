import React from "react";
import { DiscountBasics } from "@/types/discount/DiscountBasics";
import { Button, Checkbox, Switch } from "antd";
import { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { Eye, Trash } from "phosphor-react";
import { Discount, DiscountPackage } from "@/types/discount/DiscountPackage";
import ApprovalStatusPill from "@/components/ui/approval-status-pill";
import { getApprovalEntityStatusLabel } from "@/constants/approvalEntityStatus";

type Props = {
  // eslint-disable-next-line no-unused-vars
  handleSelect: (id: number, status: boolean) => void;
  handleChangeStatus: (id: number, newStatus: boolean) => void;
};

// eslint-disable-next-line no-unused-vars
const discountsColumns: (_: Props) => ColumnsType<DiscountBasics & { checked: boolean }> = ({
  handleSelect,
  handleChangeStatus
}) => [
  {
    title: "",
    dataIndex: "id",
    render: (id, record) => (
      <>
        {
          <Checkbox
            id={id}
            checked={record.checked}
            onChange={(e) => handleSelect(id, e.target.checked)}
          />
        }
      </>
    ),
    key: "SelectDiscount",
    width: 50
  },
  {
    title: "Nombre",
    dataIndex: "discount_name",
    key: "NameDiscount",
    render: (text, r) => (
      <Link passHref href={`/descuentos/regla/${r.id}`}>
        {text}
      </Link>
    ),
    sorter: (a, b) => (a.discount_name < b.discount_name ? -1 : 1)
  },
  {
    title: "Cliente",
    dataIndex: "client_name",
    key: "ClientDiscount",
    sorter: (a, b) => (a.client_name?.localeCompare(b.client_name || "") ? 1 : -1)
  },
  {
    title: "Tipo descuentos",
    dataIndex: "discount_type",
    key: "TypeDiscount",
    sorter: (a, b) => (a.discount_type < b.discount_type ? 1 : -1)
  },
  {
    title: "Definiciones",
    dataIndex: "discount_definition",
    key: "DefinitionDiscount",
    sorter: (a, b) => (a.discount_definition < b.discount_definition ? 1 : -1)
  },
  {
    title: "Fecha inicio",
    dataIndex: "start_date",
    key: "StartDateDiscount",
    sorter: (a, b) => (new Date(a.start_date) < new Date(b.start_date) ? 1 : -1),
    render: (text) => new Date(text).toLocaleDateString()
  },
  {
    title: "Fecha fin",
    dataIndex: "end_date",
    key: "EndDateDiscount",
    sorter: (a, b) => {
      if (!a.end_date) return 1; // Coloca los elementos sin `endDate` al final
      if (!b.end_date) return -1; // Coloca los elementos con `endDate` al principio
      return new Date(a.end_date) > new Date(b.end_date) ? 1 : -1; // Ordena normalmente por fecha
    },
    render: (text) => (text ? new Date(text).toLocaleDateString() : "")
  },
  {
    title: "Aprobación",
    dataIndex: "approval_entity_status_id",
    key: "ApprovalDiscount",
    sorter: (a, b) =>
      getApprovalEntityStatusLabel(a.approval_entity_status_id).localeCompare(
        getApprovalEntityStatusLabel(b.approval_entity_status_id)
      ),
    render: (statusId) => <ApprovalStatusPill statusId={statusId} />
  },
  {
    title: "Estado",
    dataIndex: "status",
    key: "StatusDiscount",
    sorter: (a, b) => a.status - b.status,
    render: (text, record) => (
      <Switch checked={text} onChange={(newStatus) => handleChangeStatus(record.id, newStatus)} />
    )
  },
  {
    title: "",
    dataIndex: "",
    key: "ActionsDiscount",
    width: 100,
    render: (text, r) => (
      <div>
        <Link href={`/descuentos/regla/${r.id}`}>
          <Button type="text" icon={<Eye size={32} style={{ padding: "0.2rem" }} />} />
        </Link>
      </div>
    )
  }
];

const discountPackagesColumns: (
  _: Props
) => ColumnsType<DiscountPackage & { checked: boolean }> = ({
  handleSelect,
  handleChangeStatus
}) => [
  {
    title: "",
    dataIndex: "id",
    render: (id, record) => (
      <>
        {
          <Checkbox
            id={id}
            checked={record.checked}
            onChange={(e) => handleSelect(id, e.target.checked)}
          />
        }
      </>
    ),
    key: "SelectDiscount",
    width: 50
  },
  {
    title: "Nombre",
    dataIndex: "name",
    key: "name",
    render: (text, r) => (
      <Link passHref href={`/descuentos/paquete/${r.id}`}>
        {text}
      </Link>
    ),
    sorter: (a, b) => a.name.localeCompare(b.name)
  },
  {
    title: "Definiciones",
    dataIndex: "discountType",
    key: "discountType",
    sorter: (a, b) => a.discountType.localeCompare(b.discountType)
  },
  {
    title: "Fecha inicio",
    dataIndex: "startDate",
    key: "startDate",
    sorter: (a, b) => (new Date(a.startDate) < new Date(b.startDate) ? 1 : -1),
    render: (text) => new Date(text).toLocaleDateString()
  },
  {
    title: "Fecha fin",
    dataIndex: "endDate",
    key: "endDate",
    sorter: (a, b) => {
      if (!a.endDate) return 1; // Coloca los elementos sin `endDate` al final
      if (!b.endDate) return -1; // Coloca los elementos con `endDate` al principio
      return new Date(a.endDate) > new Date(b.endDate) ? 1 : -1; // Ordena normalmente por fecha
    },
    render: (text) => (text ? new Date(text).toLocaleDateString() : "")
  },
  {
    title: "Aprobación",
    dataIndex: "approvalEntityStatusId",
    key: "ApprovalDiscount",
    sorter: (a, b) =>
      getApprovalEntityStatusLabel(a.approvalEntityStatusId).localeCompare(
        getApprovalEntityStatusLabel(b.approvalEntityStatusId)
      ),
    render: (statusId) => <ApprovalStatusPill statusId={statusId} />
  },
  {
    title: "Estado",
    dataIndex: "active",
    key: "StatusDiscount",
    sorter: (a, b) => (a.active && b.active ? a.active - b.active : -1),
    render: (text, record) => (
      <Switch checked={text} onChange={(newStatus) => handleChangeStatus(record.id, newStatus)} />
    )
  },
  {
    title: "",
    dataIndex: "",
    key: "ActionsDiscount",
    width: 100,
    render: (text, r) => (
      <div>
        <Link href={`/descuentos/paquete/${r.id}`}>
          <Button type="text" icon={<Eye size={32} style={{ padding: "0.2rem" }} />} />
        </Link>
      </div>
    )
  }
];

// eslint-disable-next-line no-unused-vars
const discountsFormColumns: (_: {
  remove: (index: number) => void;
  isFormDisabled: boolean;
}) => ColumnsType<Discount> = ({ remove, isFormDisabled }) => [
  {
    title: "Nombre",
    dataIndex: "discount_name",
    key: "NameDiscount",
    render: (text, r) => (
      <Link passHref href={`/descuentos/regla/${r.packageId}`}>
        {text}
      </Link>
    ),
    sorter: (a, b) =>
      a.discount_name && b.discount_name && a.discount_name < b.discount_name ? -1 : 1
  },
  {
    title: "Cliente",
    dataIndex: "client_name",
    key: "ClientDiscount",
    sorter: (a, b) => (a.client_name?.localeCompare(b.client_name || "") ? 1 : -1)
  },
  {
    title: "Tipo descuentos",
    dataIndex: "discount_type",
    key: "TypeDiscount",
    sorter: (a, b) =>
      a.discount_type && b.discount_type && a.discount_type < b.discount_type ? 1 : -1
  },
  {
    title: "Definiciones",
    dataIndex: "discount_definition",
    key: "DefinitionDiscount",
    sorter: (a, b) =>
      a.discount_definition &&
      b.discount_definition &&
      a.discount_definition < b.discount_definition
        ? 1
        : -1
  },
  {
    title: "Fecha inicio",
    dataIndex: "start_date",
    key: "StartDateDiscount",
    sorter: (a, b) => (new Date(a.start_date) < new Date(b.start_date) ? 1 : -1),
    render: (text) => new Date(text).toLocaleDateString()
  },

  {
    title: "",
    dataIndex: "",
    key: "delete",
    width: 100,
    render: (text, r, index) => (
      <Button
        type="text"
        onClick={() => remove(index)}
        disabled={isFormDisabled}
        icon={<Trash size={32} style={{ padding: "0.2rem" }} />}
      />
    )
  }
];
export { discountsColumns, discountPackagesColumns, discountsFormColumns };
