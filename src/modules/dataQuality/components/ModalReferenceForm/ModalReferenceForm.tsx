"use client";

import { useEffect, useMemo, useState } from "react";
import { Form, Input, InputNumber, Modal, Select, message } from "antd";

import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";
import { Button } from "@/modules/chat/ui/button";
import {
  ICreateReferenceFormValues,
  IReferenceScopeLevel,
  IReferenceType
} from "@/types/dataQuality/IDataQuality";
import { IReferenceClient, IReferenceCountry, IReferenceRegion } from "@/services/dataQuality/references";
import {
  REFERENCE_ALLOWED_EXTENSIONS,
  REFERENCE_SCOPE_OPTIONS,
  isAllowedReferenceFile
} from "../../references/references.utils";

interface ModalReferenceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  referenceTypes: IReferenceType[];
  countries: IReferenceCountry[];
  regions: IReferenceRegion[];
  clients: IReferenceClient[];
  /** Contexto fijo (acceso desde pais/region o cliente): ambito bloqueado. */
  lockedScopeLevel?: IReferenceScopeLevel;
  /** Contexto fijo: propietario bloqueado (data.client_data.id / country / region). */
  lockedOwnerId?: number;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (values: ICreateReferenceFormValues) => Promise<void>;
}

export function ModalReferenceForm({
  isOpen,
  onClose,
  onCreated,
  referenceTypes,
  countries,
  regions,
  clients,
  lockedScopeLevel,
  lockedOwnerId,
  onSubmit
}: ModalReferenceFormProps) {
  const [form] = Form.useForm<ICreateReferenceFormValues>();
  const [scope, setScope] = useState<IReferenceScopeLevel | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setScope(undefined);
      setFile(null);
      setFileError(null);
      setSubmitting(false);
      return;
    }
    // Acceso contextual: el ambito/propietario vienen fijados y no se editan.
    if (lockedScopeLevel) {
      setScope(lockedScopeLevel);
      form.setFieldsValue({
        scope_level: lockedScopeLevel,
        owner: lockedOwnerId
      });
    }
  }, [isOpen, form, lockedScopeLevel, lockedOwnerId]);

  const ownerOptions = useMemo(() => {
    if (scope === "client") {
      return clients.map((c) => ({
        value: c.id,
        label: c.country_name ? `${c.client_name} — ${c.country_name}` : c.client_name
      }));
    }
    if (scope === "country") {
      return countries.map((c) => ({ value: c.id, label: c.country_name }));
    }
    if (scope === "region") {
      return regions.map((r) => ({ value: r.id, label: r.abbreviation }));
    }
    return [];
  }, [scope, clients, countries, regions]);

  const handleScopeChange = (value: IReferenceScopeLevel) => {
    setScope(value);
    // Limpia el owner previo al cambiar de ambito (evita combinaciones invalidas).
    form.setFieldValue("owner", undefined);
  };

  const handleFile = (selected: File) => {
    if (!isAllowedReferenceFile(selected)) {
      setFile(null);
      setFileError(`Formato no permitido. Usa ${REFERENCE_ALLOWED_EXTENSIONS.join(", ")}.`);
      return;
    }
    setFile(selected);
    setFileError(null);
  };

  const handleFinish = async (values: ICreateReferenceFormValues) => {
    if (submitting) return;
    if (!file) {
      setFileError("El archivo Excel es obligatorio.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ ...values, file });
      message.success("Referencia creada exitosamente.");
      onCreated();
      onClose();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "No se pudo crear la referencia."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={submitting ? undefined : onClose}
      title="Nueva referencia"
      footer={null}
      destroyOnClose
      maskClosable={!submitting}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} disabled={submitting}>
        <Form.Item
          name="reference_type"
          label="Tipo de referencia"
          rules={[{ required: true, message: "Selecciona el tipo de referencia" }]}
        >
          <Select
            placeholder="Selecciona un tipo"
            options={(referenceTypes || []).map((t) => ({ value: t.code, label: t.description }))}
          />
        </Form.Item>

        <Form.Item
          name="scope_level"
          label="Ámbito"
          rules={[{ required: true, message: "Selecciona el ámbito" }]}
        >
          <Select placeholder="Selecciona el ámbito" options={REFERENCE_SCOPE_OPTIONS} onChange={handleScopeChange} disabled={!!lockedScopeLevel} />
        </Form.Item>

        <Form.Item
          name="owner"
          label={
            scope === "client" ? "Cliente" : scope === "region" ? "Región" : "País"
          }
          rules={[{ required: true, message: "Selecciona el propietario" }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            disabled={!scope || lockedOwnerId != null}
            placeholder={scope ? "Selecciona el propietario" : "Primero selecciona el ámbito"}
            options={ownerOptions}
          />
        </Form.Item>

        <Form.Item label="Archivo Excel" required>
          <UploadDropZone
            onFileUpload={handleFile}
            allowedExtensions={[...REFERENCE_ALLOWED_EXTENSIONS]}
            title="Arrastra el archivo Excel aquí"
          />
          {file && <p className="mt-2 text-sm text-[#141414]">{file.name}</p>}
          {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
        </Form.Item>

        <Form.Item name="sheet_name" label="Nombre de hoja (opcional)">
          <Input placeholder="p. ej. Sheet1" maxLength={128} />
        </Form.Item>

        <Form.Item name="header_row" label="Fila de encabezado (opcional)">
          <InputNumber min={0} className="w-full" placeholder="0" />
        </Form.Item>

        <Form.Item name="description" label="Descripción (opcional)">
          <Input.TextArea rows={2} maxLength={500} />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119]"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Crear referencia"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
