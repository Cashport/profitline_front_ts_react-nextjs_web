import { useMemo } from "react";
import { Button, Input, Typography, Upload } from "antd";
import { UploadSimple, X } from "phosphor-react";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { formatNumber } from "@/utils/utils";
import { downloadCsv, parseIds } from "./bulk-search-utils";
import { IBulkSearchFile } from "./types";

interface Props {
  text: string;
  file: IBulkSearchFile | null;
  /** IDs del archivo o, si no hay archivo, del texto pegado. Sin definir si es un Excel. */
  ids?: string[];
  onTextChange: (text: string) => void;
  onFileChange: (file: IBulkSearchFile | null) => void;
  onCancel: () => void;
  onSearch: () => void;
}

// Encabezado de la plantilla ("ID factura"): no son identificadores
const TEMPLATE_HEADER_TOKENS = ["ID", "FACTURA"];

const BulkSearchInputStep = ({
  text,
  file,
  ids,
  onTextChange,
  onFileChange,
  onCancel,
  onSearch
}: Props) => {
  const repeated = useMemo(() => (ids ? ids.length - new Set(ids).size : 0), [ids]);
  // Del Excel no se sabe cuántos trae hasta buscar
  const isInvalid = ids !== undefined && !ids.length;

  const summary = !ids
    ? "Excel listo para buscar"
    : !ids.length
      ? "Sin identificadores todavía"
      : `${formatNumber(ids.length)} identificadores${repeated ? ` · ${formatNumber(repeated)} repetidos` : ""}`;

  const handleBeforeUpload = (selectedFile: File) => {
    if (/\.(csv|txt)$/i.test(selectedFile.name)) {
      selectedFile.text().then((content) =>
        onFileChange({
          name: selectedFile.name,
          file: selectedFile,
          ids: parseIds(content).filter((id) => !TEMPLATE_HEADER_TOKENS.includes(id))
        })
      );
    } else {
      // El Excel lo lee el backend al buscar
      onFileChange({ name: selectedFile.name, file: selectedFile });
    }
    // No se sube aquí: el archivo se envía al buscar
    return Upload.LIST_IGNORE;
  };

  return (
    <>
      <div className="grid min-h-0 flex-1 grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-4 overflow-auto px-[22px] py-5">
        <div className="flex min-h-[240px] flex-col gap-2">
          <span className="text-[13px] font-semibold">Pega los identificadores</span>
          {file ? (
            <div className="flex min-h-[200px] flex-1 items-center justify-center rounded-lg border border-[#ececec] bg-[#fafafa] p-4 text-center text-xs text-[#8a8a8a]">
              Se usará el archivo cargado. Quítalo para pegar identificadores.
            </div>
          ) : (
            <Input.TextArea
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              placeholder={"VT-255786\nVT-255787\nVT-255788\n…"}
              className="flex-1 !font-mono !text-[13px]"
              style={{ minHeight: 200, lineHeight: 1.6, resize: "none" }}
            />
          )}
          <span className="text-[11px] text-[#8a8a8a]">
            Uno por línea, o separados por espacio, coma o punto y coma.
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold">O carga un archivo</span>
          {file ? (
            <div className="flex min-h-[200px] flex-1 items-center justify-center rounded-lg border border-foreground p-4">
              <div className="flex min-w-0 max-w-full items-center gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-[#f4f9d2] text-[10px] font-bold">
                  {file.name.split(".").pop()?.slice(0, 3).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium">{file.name}</span>
                  <span className="block text-[11px] text-[#8a8a8a]">
                    {file.ids ? `${formatNumber(file.ids.length)} registros` : "Se lee al buscar"}
                  </span>
                </span>
                <Button
                  type="text"
                  aria-label="Quitar archivo"
                  icon={<X size={12} />}
                  onClick={() => onFileChange(null)}
                />
              </div>
            </div>
          ) : (
            <Upload.Dragger
              accept=".csv,.txt,.xlsx"
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              className="flex min-h-[200px] flex-1 flex-col"
              style={{ flex: 1 }}
            >
              <div className="flex flex-col items-center gap-2 px-4">
                <UploadSimple size={26} />
                <span className="text-[13px] font-medium">Arrastra o selecciona un archivo</span>
                <span className="text-[11px] text-[#8a8a8a]">
                  Excel o CSV · una columna con el ID de factura
                </span>
              </div>
            </Upload.Dragger>
          )}
          <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[11px]">
            <Typography.Link
              underline
              className="!text-[11px]"
              onClick={() =>
                downloadCsv(
                  "plantilla_busqueda_masiva.csv",
                  ["ID factura"],
                  [["VT-255786"], ["VT-255787"]]
                )
              }
            >
              Descargar plantilla
            </Typography.Link>
          </div>
        </div>
      </div>

      <footer className="flex flex-none items-center gap-2.5 border-t border-[#ececec] px-[22px] py-3.5">
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{summary}</span>
        <Button type="text" size="large" onClick={onCancel}>
          Cancelar
        </Button>
        <PrincipalButton disabled={isInvalid} onClick={onSearch}>
          {ids?.length ? `Buscar ${formatNumber(ids.length)} facturas` : "Buscar facturas"}
        </PrincipalButton>
      </footer>
    </>
  );
};

export default BulkSearchInputStep;
