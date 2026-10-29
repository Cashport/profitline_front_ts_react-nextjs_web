"use client";

import { Button, Modal } from "antd";

import { IIqviaAuxUploadResult } from "@/types/dataQuality/IDataQuality";

type IqviaUploadResultModalProps = {
  title: string;
  result: IIqviaAuxUploadResult | null;
  onClose: () => void;
};

export const IqviaUploadResultModal: React.FC<IqviaUploadResultModalProps> = ({
  title,
  result,
  onClose
}) => {
  return (
    <Modal
      open={result !== null}
      onCancel={onClose}
      title={title}
      footer={<Button onClick={onClose}>Cerrar</Button>}
      width={760}
      centered
    >
      {result && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span>
              Filas leídas: <b>{result.total_filas}</b>
            </span>
            <span>
              Insertados: <b>{result.insertados}</b>
            </span>
            <span>
              Actualizados: <b>{result.actualizados}</b>
            </span>
            <span>
              Sin cambios: <b>{result.sin_cambios}</b>
            </span>
            <span className={result.errores.length ? "text-red-600" : ""}>
              Errores: <b>{result.errores.length}</b>
            </span>
          </div>

          {result.errores.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-red-600">Errores por fila</p>
              <div className="max-h-64 overflow-auto rounded border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-cp-line bg-cp-surface">
                      <th className="px-3 py-3 text-[13.5px] font-semibold text-cp-ink">Fila</th>
                      <th className="px-3 py-3 text-[13.5px] font-semibold text-cp-ink">
                        Cod_Iqvia
                      </th>
                      <th className="px-3 py-3 text-[13.5px] font-semibold text-cp-ink">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errores.map((error, index) => (
                      <tr key={`${error.fila}-${index}`} className="border-t border-gray-100">
                        <td className="px-3 py-2">{error.fila}</td>
                        <td className="px-3 py-2">{error.cod_iqvia ?? "-"}</td>
                        <td className="px-3 py-2">{error.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-green-700">El archivo se procesó sin errores.</p>
          )}
        </div>
      )}
    </Modal>
  );
};
