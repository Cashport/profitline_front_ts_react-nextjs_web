import { Control, Controller } from "react-hook-form";
import { Button, DatePicker, Dropdown, Input, InputNumber, Select, TableProps } from "antd";
import { Check, Copy, DotsThreeVertical, PencilSimple, Trash, X } from "phosphor-react";

import { CellField } from "./CellField";
import { DATE_FORMAT, FALLBACK_STATUS_COLOR, REQUIRED_MSG } from "./constants";

import { ClaimsForm, ClaimTableRow } from "./types";
import { ClaimStatus, IClaimStatus } from "@/types/claims/IClaims";
import { IFormatMoneyStore } from "@/lib/slices/formatMoneySlice";

interface GetClaimsColumnsProps {
  control: Control<ClaimsForm>;
  statusOptions: { value: ClaimStatus; label: string }[];
  /** Catalog indexed by its `description` code, to resolve a row's label and color */
  statusByCode: Map<ClaimStatus, IClaimStatus>;
  // eslint-disable-next-line no-unused-vars
  isEditing: (row: ClaimTableRow) => boolean;
  /** fieldId of the row currently hitting the API, so only that row shows a spinner */
  savingId: string | null;
  formatMoney: IFormatMoneyStore["formatMoney"];
  // eslint-disable-next-line no-unused-vars
  onStartEdit: (row: ClaimTableRow) => void;
  // eslint-disable-next-line no-unused-vars
  onSave: (row: ClaimTableRow) => void;
  // eslint-disable-next-line no-unused-vars
  onCancel: (row: ClaimTableRow) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (row: ClaimTableRow) => void;
  // eslint-disable-next-line no-unused-vars
  onDuplicate: (row: ClaimTableRow) => void;
}

// The controls are borderless, so the invalid state has to draw its own border back in
const cellControlClass = (hasError: boolean, modifier = "") =>
  `modalInvoiceClaims__cellControl${modifier && ` ${modifier}`}${hasError ? " -error" : ""}`;

export const getClaimsColumns = ({
  control,
  statusOptions,
  statusByCode,
  isEditing,
  savingId,
  formatMoney,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  onDuplicate
}: GetClaimsColumnsProps): TableProps<ClaimTableRow>["columns"] => {
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
      ellipsis: true,
      render: (concepto: string, record) =>
        isEditing(record) ? (
          <Controller
            name={`claims.${record.index}.concepto`}
            control={control}
            rules={{ required: REQUIRED_MSG, validate: (value) => !!value?.trim() || REQUIRED_MSG }}
            render={({ field, fieldState }) => (
              <CellField error={fieldState.error}>
                <Input
                  {...field}
                  variant="borderless"
                  className={cellControlClass(!!fieldState.error)}
                  placeholder="Concepto de la glosa"
                />
              </CellField>
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
      width: 150,
      render: (estado: ClaimTableRow["estado"], record) => {
        if (isEditing(record)) {
          return (
            <Controller
              name={`claims.${record.index}.estado`}
              control={control}
              rules={{ required: REQUIRED_MSG }}
              render={({ field, fieldState }) => (
                <CellField error={fieldState.error}>
                  <Select
                    {...field}
                    // a row seeded before the catalog resolved holds "", which would render blank
                    value={field.value || undefined}
                    variant="borderless"
                    className={cellControlClass(!!fieldState.error)}
                    options={statusOptions}
                    placeholder="Seleccionar"
                    popupMatchSelectWidth={false}
                  />
                </CellField>
              )}
            />
          );
        }

        const status = statusByCode.get(estado);
        return (
          <p className="cell -status" style={{ color: status?.color ?? FALLBACK_STATUS_COLOR }}>
            {status?.status_name ?? estado}
          </p>
        );
      }
    },
    {
      title: "Fecha glosa",
      dataIndex: "fechaGlosa",
      key: "fechaGlosa",
      width: 150,
      render: (fechaGlosa: ClaimTableRow["fechaGlosa"], record) =>
        isEditing(record) ? (
          <Controller
            name={`claims.${record.index}.fechaGlosa`}
            control={control}
            rules={{ required: REQUIRED_MSG }}
            render={({ field, fieldState }) => (
              <CellField error={fieldState.error}>
                <DatePicker
                  {...field}
                  variant="borderless"
                  className={cellControlClass(!!fieldState.error)}
                  format={DATE_FORMAT}
                  placeholder={DATE_FORMAT.toLowerCase()}
                />
              </CellField>
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
      width: 150,
      render: (fechaContestacion: ClaimTableRow["fechaContestacion"], record) =>
        isEditing(record) ? (
          <Controller
            name={`claims.${record.index}.fechaContestacion`}
            control={control}
            rules={{ required: REQUIRED_MSG }}
            render={({ field, fieldState }) => (
              <CellField error={fieldState.error}>
                <DatePicker
                  {...field}
                  variant="borderless"
                  className={cellControlClass(!!fieldState.error)}
                  format={DATE_FORMAT}
                  placeholder={DATE_FORMAT.toLowerCase()}
                />
              </CellField>
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
      ellipsis: true,
      render: (observacion: string, record) =>
        isEditing(record) ? (
          <Controller
            name={`claims.${record.index}.observacion`}
            control={control}
            rules={{ required: REQUIRED_MSG, validate: (value) => !!value?.trim() || REQUIRED_MSG }}
            render={({ field, fieldState }) => (
              <CellField error={fieldState.error}>
                <Input
                  {...field}
                  variant="borderless"
                  className={cellControlClass(!!fieldState.error)}
                  placeholder="Observación"
                />
              </CellField>
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
      width: 120,
      align: "right",
      render: (monto: ClaimTableRow["monto"], record) =>
        isEditing(record) ? (
          <Controller
            name={`claims.${record.index}.monto`}
            control={control}
            rules={{
              required: REQUIRED_MSG,
              min: { value: 1, message: "El monto debe ser mayor a cero" }
            }}
            render={({ field, fieldState }) => (
              <CellField error={fieldState.error} alignRight>
                <InputNumber
                  {...field}
                  variant="borderless"
                  className={cellControlClass(!!fieldState.error, "-alignRight")}
                  min={0}
                  controls={false}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  parser={(value) => parseFloat(value?.replace(/\./g, "") || "0")}
                  placeholder="0"
                />
              </CellField>
            )}
          />
        ) : (
          <p className="cell -alignRight fontMonoSpace">{formatMoney(monto ?? 0)}</p>
        )
    },
    {
      title: "",
      key: "actions",
      width: 140,
      // fixed: "right",
      render: (_, record) =>
        isEditing(record) ? (
          <div className="modalInvoiceClaims__rowActions">
            <Button
              className="modalInvoiceClaims__saveBtn"
              icon={<Check size={16} />}
              loading={savingId === record.fieldId}
              onClick={() => onSave(record)}
            >
              Guardar
            </Button>
            <Button
              type="text"
              icon={<X size={16} />}
              disabled={!!savingId}
              onClick={() => onCancel(record)}
            />
          </div>
        ) : (
          <div className="modalInvoiceClaims__rowActions">
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
          </div>
        )
    }
  ];
};
