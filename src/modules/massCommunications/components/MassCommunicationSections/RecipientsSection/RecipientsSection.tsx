"use client";
import { useState, useEffect, useCallback } from "react";
import { Button, Input, Tag, Typography, Flex } from "antd";
import { CheckCircle2, XCircle, FileDown, Users, X } from "lucide-react";
import {
  validateClients,
  getCurrentValidatedClients
} from "@/services/communications/communications";
import type { IValidatedClients } from "@/types/communications/ICommunications";

const { Text } = Typography;
const { TextArea } = Input;

const placeholderStyle = `
  .recipients-textarea::placeholder {
    color: #0a0a0ad0 !important;
  }
`;

interface RecipientsSectionProps {
  onValidatedCountChange: (count: number) => void;
}

export default function RecipientsSection({ onValidatedCountChange }: RecipientsSectionProps) {
  const [rawIds, setRawIds] = useState("");
  const [hasValidated, setHasValidated] = useState(false);
  const [validClients, setValidClients] = useState<IValidatedClients[]>([]);
  const [invalidIds, setInvalidIds] = useState<string[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    getCurrentValidatedClients()
      .then((data) => setTotalClients(data.length))
      .catch((err) => console.error("Error fetching client list", err));
  }, []);

  const handleRawIdsChange = useCallback(
    (value: string) => {
      setRawIds(value);
      if (hasValidated) setHasValidated(false);
    },
    [hasValidated]
  );

  const handleValidate = useCallback(async () => {
    const ids = rawIds
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) return;

    setIsValidating(true);
    try {
      const result = await validateClients(ids);
      const valid = result.filter((c) => c.isValid);
      const invalid = result.filter((c) => !c.isValid).map((c) => c.clientId);

      setValidClients(valid);
      setInvalidIds(invalid);
      setHasValidated(true);
      onValidatedCountChange(valid.length);
    } catch (error) {
      console.error("Error validating clients", error);
    } finally {
      setIsValidating(false);
    }
  }, [rawIds, onValidatedCountChange]);

  const handleClear = useCallback(() => {
    setRawIds("");
    setHasValidated(false);
    setValidClients([]);
    setInvalidIds([]);
    onValidatedCountChange(0);
  }, [onValidatedCountChange]);

  const handleDownloadReport = useCallback(() => {
    console.log("Downloading validation report...");
  }, []);

  return (
    <section className="bg-white rounded-lg p-6">
      <style>{placeholderStyle}</style>
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
          onChange={(e) => handleRawIdsChange(e.target.value)}
          placeholder={"COL-001, COL-002, MEX-001\no uno por linea:\nCOL-001\nCOL-002\nMEX-001"}
          autoSize={{ minRows: 4 }}
          className="flex-1 font-mono text-sm"
          classNames={{ textarea: "recipients-textarea" }}
        />
        <Flex vertical gap={8}>
          <Button
            type="primary"
            onClick={rawIds.trim() ? handleValidate : undefined}
            icon={<CheckCircle2 size={16} />}
            className="bg-[#141414] border-[#141414] hover:bg-[#2a2a2a]"
            loading={isValidating}
            style={{
              ...(!rawIds.trim() && { opacity: 0.4, pointerEvents: "none" })
            }}
          >
            Validar
          </Button>
          {hasValidated && (
            <Button onClick={handleClear} icon={<X size={16} />} className="!bg-[#fafafa]">
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 31,
                fontSize: 14,
                fontWeight: 500
              }}
            >
              {validClients.length} clientes encontrados
            </Tag>
            {invalidIds.length > 0 && (
              <Tag
                color="error"
                icon={<XCircle size={14} className="mr-1.5" />}
                className="text-[13px] px-3 py-1"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  height: 31,
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                {invalidIds.length} no encontrados
              </Tag>
            )}
            <Text type="secondary" className="text-xs">
              de {totalClients.toLocaleString()} clientes totales
            </Text>
          </Flex>
          <Button
            size="small"
            onClick={handleDownloadReport}
            icon={<FileDown size={14} />}
            className="!bg-[#fafafa] !font-medium !text-xs"
            style={{ height: 31 }}
          >
            Descargar reporte
          </Button>
        </Flex>
      )}
    </section>
  );
}
