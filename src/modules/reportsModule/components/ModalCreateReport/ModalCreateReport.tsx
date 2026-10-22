"use client";

import { useState } from "react";
import { Flex, Input, Modal, Select, Typography } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";
import { useMessageApi } from "@/context/MessageContext";
import type { IReport, IReportType } from "@/types/reports/IReports";

import HtmlFileChip from "./html-file-chip";
import { REPORT_FILE_EXTENSIONS, REPORT_FILE_MAX_MB } from "../../constants";
import { useReports } from "../../hooks/useReports";
import { nameFromFile } from "../../utils/reports-format";

const { Title } = Typography;

const LABEL_CLASS = "text-xs font-semibold uppercase tracking-wide text-gray-500";

interface ModalCreateReportProps {
  isOpen: boolean;
  types: IReportType[];
  onClose: () => void;
  /** "+ Crear tipo": el contenedor cierra este modal y abre el de tipos. */
  onCreateType: () => void;
  onSuccess?: (report: IReport) => void;
}

/** "Publicar informe": tipo, nombre y el archivo .html que verá el equipo. */
export function ModalCreateReport({
  isOpen,
  types,
  onClose,
  onCreateType,
  onSuccess
}: ModalCreateReportProps) {
  const [typeId, setTypeId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { publishReport } = useReports();
  const { showMessage } = useMessageApi();

  const isReady = Boolean(typeId && name.trim() && file);

  // Se vacía al cancelar o publicar, no al pasar a "Crear tipo": al volver de
  // ese modal sigue lo que ya se había llenado.
  const handleClose = () => {
    setTypeId(null);
    setName("");
    setFile(null);
    setFileError(null);
    onClose();
  };

  const handleFileUpload = (selected: File) => {
    if (!/\.html?$/i.test(selected.name)) {
      setFileError("El archivo debe ser .html");
      return;
    }
    if (selected.size > REPORT_FILE_MAX_MB * 1024 * 1024) {
      setFileError(`El archivo supera ${REPORT_FILE_MAX_MB} MB`);
      return;
    }
    setFileError(null);
    setFile(selected);
    // Sin nombre escrito, se propone el del archivo.
    setName((current) => current || nameFromFile(selected.name));
  };

  const handleOk = async () => {
    if (!typeId || !name.trim() || !file) return;

    setIsLoading(true);
    try {
      const report = await publishReport({ report_type_id: typeId, name: name.trim(), file });
      showMessage("success", "Informe publicado");
      onSuccess?.(report);
      handleClose();
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "No se pudo publicar el informe.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={600}
      onCancel={isLoading ? undefined : handleClose}
      title={<Title level={4}>Publicar informe</Title>}
      footer={
        <FooterButtons
          titleConfirm="Publicar informe"
          isConfirmDisabled={!isReady}
          isConfirmLoading={isLoading}
          onClose={handleClose}
          handleOk={handleOk}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="1.25rem" style={{ marginBottom: "1rem" }}>
        <p className="-mt-2 text-sm text-gray-500">
          Quedará disponible para el equipo en el listado de informes.
        </p>

        {/* Tipo de informe */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className={LABEL_CLASS}>
              Tipo de informe <span className="text-red-500">*</span>
            </p>
            <button
              type="button"
              onClick={onCreateType}
              className="text-xs font-medium text-[#1677ff] hover:underline"
            >
              + Crear tipo
            </button>
          </div>
          <Select
            size="large"
            className="w-full"
            placeholder="Selecciona un tipo"
            value={typeId ?? undefined}
            onChange={setTypeId}
            options={types.map((t) => ({ value: t.id, label: t.name }))}
          />
        </div>

        {/* Nombre del informe */}
        <div>
          <p className={`mb-2 ${LABEL_CLASS}`}>
            Nombre del informe <span className="text-red-500">*</span>
          </p>
          <Input
            size="large"
            placeholder="Ej. Informe cierre julio"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Archivo HTML */}
        <div>
          <p className={`mb-2 ${LABEL_CLASS}`}>
            Archivo HTML <span className="text-red-500">*</span>
          </p>
          {file ? (
            <HtmlFileChip file={file} onRemove={() => setFile(null)} disabled={isLoading} />
          ) : (
            <UploadDropZone
              onFileUpload={handleFileUpload}
              allowedExtensions={REPORT_FILE_EXTENSIONS}
              title="Arrastra el archivo HTML aquí"
              subtitle={`Archivo .html generado en Claude · máx. ${REPORT_FILE_MAX_MB} MB`}
            />
          )}
          {fileError && <p className="mt-2 text-xs text-red-500">{fileError}</p>}
        </div>
      </Flex>
    </Modal>
  );
}
