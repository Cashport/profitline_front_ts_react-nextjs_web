import { Control, Controller } from "react-hook-form";
import { Button, DatePicker, Dropdown, Input, InputNumber, Select, TableProps } from "antd";
import { Check, Copy, DotsThreeVertical, PencilSimple, Trash, X } from "phosphor-react";

import SimpleTag from "@/components/atoms/SimpleTag/SimpleTag";

import {
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_META,
  CLAIM_STATUS_OPTIONS,
  DATE_FORMAT,
  FALLBACK_STATUS_META
} from "./constants";

import { ClaimsForm, ClaimTableRow } from "./types";
import { IFormatMoneyStore } from "@/lib/slices/formatMoneySlice";

interface GetClaimsColumnsProps {
  control: Control<ClaimsForm>;
  editingId: string | null;
  isSaving: boolean;
  formatMoney: IFormatMoneyStore["formatMoney"];
  // eslint-disable-next-line no-unused-vars
  onStartEdit: (row: ClaimTableRow) => void;
  onSave: () => void;
  onCancel: () => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (row: ClaimTableRow) => void;
  // eslint-disable-next-line no-unused-vars
  onDuplicate: (row: ClaimTableRow) => void;
}

export const getClaimsColumns = ({
  control,
  editingId,
  isSaving,
  formatMoney,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  onDuplicate
}: GetClaimsColumnsProps): TableProps<ClaimTableRow>["columns"] => {
  const isEditing = (row: ClaimTableRow) => editingId === row.fieldId;

  return [
    {
      title: "ID glosa",
      dataIndex: "claimNumber",
      key: "claimNumber",
      width: 140,
      render: (_, record) => (
        <span className="modalInvoiceClaims__idCell">
          {record.claimNumber || "—"}
          {record._new && <em>nuevo</em>}
        </span>
      )
    },
    {
      title: "Concepto",
      dataIndex: "concepto",
      key: "concepto",
      render: (concepto: string, record) =>
        isEditing(record) ? (
          <Controller
            name={`claims.${record.index}.concepto`}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                {...field}
                variant="borderless"
                className="modalInvoiceClaims__cellControl"
                placeholder="Concepto de la glosa"
              />
            )}
          />
        ) : (
          <p className="cell">{concepto}</p>
        )
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 170,
      render: (estado: ClaimTableRow["estado"], record) =>
        isEditing(record) ? (
          <Controller
            name={`claims.${record.index}.estado`}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                {...field}
                variant="borderless"
                className="modalInvoiceClaims__cellControl"
                options={CLAIM_STATUS_OPTIONS}
                popupMatchSelectWidth={false}
              />
            )}
          />
        ) : (
          <SimpleTag
            text={CLAIM_STATUS_LABELS[estado] ?? estado}
            colorTag={(CLAIM_STATUS_META[estado] ?? FALLBACK_STATUS_META).bg}
            colorText={(CLAIM_STATUS_META[estado] ?? FALLBACK_STATUS_META).text}
            fontSize="0.75rem"
          />
        )
    },
    {
      title: "Fecha glosa",
      dataIndex: "fechaGlosa",
      key: "fechaGlosa",
      width: 110,
      render: (fechaGlosa: ClaimTableRow["fechaGlosa"], record) =>
        isEditing(record) ? (
          <Controller
            name={`claims.${record.index}.fechaGlosa`}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DatePicker
                {...field}
                variant="borderless"
                className="modalInvoiceClaims__cellControl"
                format={DATE_FORMAT}
                placeholder={DATE_FORMAT.toLowerCase()}
              />
            )}
          />
        ) : (
          <p className="cell">{fechaGlosa ? fechaGlosa.format(DATE_FORMAT) : "-"}</p>
        )
    },
    {
      title: "Fecha contestación",
      dataIndex: "fechaContestacion",
      key: "fechaContestacion",
      width: 170,
      render: (fechaContestacion: ClaimTableRow["fechaContestacion"], record) =>
        isEditing(record) ? (
          <Controller
            name={`claims.${record.index}.fechaContestacion`}
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                variant="borderless"
                className="modalInvoiceClaims__cellControl"
                format={DATE_FORMAT}
                placeholder={DATE_FORMAT.toLowerCase()}
              />
            )}
          />
        ) : (
          <p className="cell">{fechaContestacion ? fechaContestacion.format(DATE_FORMAT) : "-"}</p>
        )
    },
    {
      title: "Observación",
      dataIndex: "observacion",
      key: "observacion",
      render: (observacion: string, record) =>
        isEditing(record) ? (
          <Controller
            name={`claims.${record.index}.observacion`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                variant="borderless"
                className="modalInvoiceClaims__cellControl"
                placeholder="Observación"
              />
            )}
          />
        ) : (
          <p className="cell -muted">{observacion || "-"}</p>
        )
    },
    {
      title: "Monto",
      dataIndex: "monto",
      key: "monto",
      align: "right",
      width: 160,
      render: (monto: number, record) =>
        isEditing(record) ? (
          <Controller
            name={`claims.${record.index}.monto`}
            control={control}
            rules={{ min: 1 }}
            render={({ field }) => (
              <InputNumber
                {...field}
                variant="borderless"
                className="modalInvoiceClaims__cellControl -alignRight"
                min={0}
                controls={false}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                parser={(value) => parseFloat(value?.replace(/\./g, "") || "0")}
                placeholder="0"
              />
            )}
          />
        ) : (
          <p className="cell -alignRight fontMonoSpace">{formatMoney(monto)}</p>
        )
    },
    {
      title: "",
      key: "actions",
      width: 45,
      render: (_, record) =>
        isEditing(record) ? (
          <div className="modalInvoiceClaims__rowActions">
            <Button
              className="modalInvoiceClaims__saveBtn"
              icon={<Check size={16} />}
              loading={isSaving}
              onClick={onSave}
            >
              Guardar
            </Button>
            <Button type="text" icon={<X size={16} />} disabled={isSaving} onClick={onCancel} />
          </div>
        ) : (
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: "edit",
                  label: "Editar",
                  icon: <PencilSimple size={16} />,
                  onClick: () => onStartEdit(record)
                },
                {
                  key: "duplicate",
                  label: "Duplicar",
                  icon: <Copy size={16} />,
                  onClick: () => onDuplicate(record)
                },
                { type: "divider", key: "divider" },
                {
                  key: "delete",
                  label: "Eliminar",
                  icon: <Trash size={16} />,
                  danger: true,
                  onClick: () => onDelete(record)
                }
              ]
            }}
          >
            <Button
              className="modalInvoiceClaims__dotsBtn"
              icon={<DotsThreeVertical size={16} />}
            />
          </Dropdown>
        )
    }
  ];
};
