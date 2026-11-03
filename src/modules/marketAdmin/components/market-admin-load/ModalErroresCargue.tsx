"use client";

import { useEffect, useState } from "react";
import { Modal, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getProfitLoaderBatchDetail } from "@/services/marketAdmin/marketAdmin";
import {
  IProfitLoaderBatchDetail,
  IProfitLoaderBatchError,
  IProfitLoaderTimelineItem
} from "@/types/marketAdmin/IMarketAdmin";
import { EstadoPill, formatDateTime } from "./dataLoadUtils";

type Props = {
  open: boolean;
  loaderId: number | null;
  item: IProfitLoaderTimelineItem | null;
  onClose: () => void;
};

const sectionTitle = "text-sm font-bold text-[#141414] mb-2";

const errorColumns: ColumnsType<IProfitLoaderBatchError> = [
  { title: "Fila", dataIndex: "row_number", width: 70, render: (v) => v || "—" },
  { title: "Columna", dataIndex: "field_name", width: 160, render: (v) => v || "—" },
  { title: "Error", dataIndex: "error_message" },
  {
    title: "Tipo",
    key: "tipo",
    width: 110,
    render: (_, e) => (
      <EstadoPill
        label={e.is_fatal ? "Bloqueante" : "Advertencia"}
        color={e.is_fatal ? "red" : "yellow"}
      />
    )
  }
];

export default function ModalErroresCargue({ open, loaderId, item, onClose }: Props) {
  const [detail, setDetail] = useState<IProfitLoaderBatchDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open || !loaderId || !item) return;
    let active = true;
    setDetail(null);
    setFailed(false);
    getProfitLoaderBatchDetail(loaderId, item.batch_id)
      .then((data) => active && setDetail(data))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [open, loaderId, item]);

  const file = detail?.files.find((f) => f.id === item?.file_id) ?? detail?.files[0];
  const errors = detail?.errors.filter((e) => !e.file_id || e.file_id === item?.file_id) ?? [];
  const validations =
    detail?.validations.filter(
      (v) => v.status === "FAIL" || v.status === "ANOMALY" || v.status === "ERROR"
    ) ?? [];
  const executions =
    detail?.executions.filter(
      (e) =>
        (e.level === "ERROR" || e.level === "WARNING") &&
        (!e.file_id || e.file_id === item?.file_id)
    ) ?? [];
  const nothing =
    !file?.error_message && !errors.length && !validations.length && !executions.length;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={860}
      destroyOnClose
      title={
        <div className="flex items-center gap-2 pr-6">
          <span className="text-base font-bold text-[#141414] truncate">{item?.file_name}</span>
          {item && <EstadoPill label={item.label} color={item.color} />}
        </div>
      }
    >
      {!detail && !failed ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : failed ? (
        <p className="text-sm text-[#B00020] py-6">No se pudo leer el detalle del cargue.</p>
      ) : (
        <div className="flex flex-col gap-5 py-2">
          <p className="text-[13px] text-[#999999]">
            {item && `${formatDateTime(item.uploaded_at)} · ${item.uploaded_by}`}
            {file && ` · ${file.rows_raw} filas leídas · ${file.rows_loaded} cargadas`}
          </p>

          {file?.error_message && (
            <div className="rounded-lg bg-[#FDE8E8] text-[#B00020] text-sm px-3 py-2.5">
              {file.error_message}
            </div>
          )}

          {errors.length > 0 && (
            <div>
              <p className={sectionTitle}>Errores por fila ({errors.length})</p>
              <Table
                size="small"
                rowKey="id"
                columns={errorColumns}
                dataSource={errors}
                pagination={{ pageSize: 10, showSizeChanger: false, hideOnSinglePage: true }}
              />
            </div>
          )}

          {validations.length > 0 && (
            <div>
              <p className={sectionTitle}>Validaciones que no se cumplieron</p>
              <div className="flex flex-col gap-2">
                {validations.map((v) => (
                  <div key={v.id} className="rounded-lg border border-[#EEEEEE] px-3 py-2 text-sm">
                    <span className="font-semibold text-[#141414]">{v.validation_name}</span>
                    {v.message && <p className="text-[13px] text-[#555555] mt-0.5">{v.message}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {executions.length > 0 && (
            <div>
              <p className={sectionTitle}>Registro del proceso</p>
              <div className="flex flex-col gap-1.5">
                {executions.map((e) => (
                  <div key={e.id} className="flex gap-2 text-[13px]">
                    <EstadoPill
                      label={e.level === "ERROR" ? "Error" : "Aviso"}
                      color={e.level === "ERROR" ? "red" : "yellow"}
                    />
                    <span className="text-[#555555] break-words min-w-0">{e.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nothing && <p className="text-sm text-[#999999]">Este cargue no registró errores.</p>}
        </div>
      )}
    </Modal>
  );
}
