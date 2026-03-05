"use client";
import { Button, Input, Tag, Typography, Flex } from "antd";
import { CheckCircle2, XCircle, FileDown, Users, X } from "lucide-react";
import type { IValidatedClient } from "../../../lib/mockData";

const { Text } = Typography;
const { TextArea } = Input;

interface RecipientsSectionProps {
  rawIds: string;
  onRawIdsChange: (value: string) => void;
  hasValidated: boolean;
  validatedClients: IValidatedClient[];
  invalidIds: string[];
  totalClients: number;
  onValidate: () => void;
  onClear: () => void;
  onDownloadReport: () => void;
}

export default function RecipientsSection({
  rawIds,
  onRawIdsChange,
  hasValidated,
  validatedClients,
  invalidIds,
  totalClients,
  onValidate,
  onClear,
  onDownloadReport
}: RecipientsSectionProps) {
  return (
    <section className="bg-white border border-[#DDDDDD] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-[#141414] text-white flex items-center justify-center text-xs font-bold">
          2
        </div>
        <Text strong className="text-[15px]">
          Destinatarios
        </Text>
        <Users size={16} className="text-gray-400 ml-1" />
      </div>

      <Flex gap={12}>
        <TextArea
          value={rawIds}
          onChange={(e) => onRawIdsChange(e.target.value)}
          placeholder={"COL-001, COL-002, MEX-001\no uno por linea:\nCOL-001\nCOL-002\nMEX-001"}
          className="flex-1 min-h-24 font-mono text-sm"
        />
        <Flex vertical gap={8}>
          <Button
            type="primary"
            onClick={onValidate}
            disabled={!rawIds.trim()}
            icon={<CheckCircle2 size={16} />}
            className="bg-[#141414] border-[#141414] hover:bg-[#2a2a2a]"
          >
            Validar
          </Button>
          {hasValidated && (
            <Button onClick={onClear} icon={<X size={16} />}>
              Limpiar
            </Button>
          )}
        </Flex>
      </Flex>

      {hasValidated && (
        <Flex wrap="wrap" align="center" justify="space-between" gap={12} className="mt-4">
          <Flex wrap="wrap" align="center" gap={12}>
            <Tag
              color="success"
              icon={<CheckCircle2 size={14} className="mr-1.5" />}
              className="text-[13px] px-3 py-1"
            >
              {validatedClients.length} clientes encontrados
            </Tag>
            {invalidIds.length > 0 && (
              <Tag
                color="error"
                icon={<XCircle size={14} className="mr-1.5" />}
                className="text-[13px] px-3 py-1"
              >
                {invalidIds.length} no encontrados
              </Tag>
            )}
            <Text type="secondary" className="text-xs">
              de {totalClients.toLocaleString()} clientes totales
            </Text>
          </Flex>
          <Button size="small" onClick={onDownloadReport} icon={<FileDown size={14} />}>
            Descargar reporte
          </Button>
        </Flex>
      )}
    </section>
  );
}
