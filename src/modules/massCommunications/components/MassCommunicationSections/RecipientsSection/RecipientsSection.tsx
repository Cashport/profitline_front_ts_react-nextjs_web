"use client";
import { useState, useEffect, useCallback } from "react";
import { Button, Tag, Typography, Flex, message } from "antd";
import { CheckCircle2, XCircle, FileDown, Users, X } from "lucide-react";
import { useTranslations } from "use-intl";
import { validateClients } from "@/services/communications/communications";
import { useClientList } from "@/modules/massCommunications/hooks/useClientList";
import type { IValidatedClients } from "@/types/communications/ICommunications";

import "./recipientsSection.scss";

const { Text } = Typography;

const normalizeIds = (input: string): string[] => {
  return Array.from(
    new Set(
      input
        .split(/[\s,;]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
};

interface RecipientsSectionProps {
  onValidatedCountChange: (count: number) => void;
}

export default function RecipientsSection({ onValidatedCountChange }: RecipientsSectionProps) {
  const t = useTranslations("massCommunications.recipients");
  const tCommon = useTranslations("common");
  const [rawIds, setRawIds] = useState("");
  const [hasValidated, setHasValidated] = useState(false);
  const [validClients, setValidClients] = useState<IValidatedClients[]>([]);
  const [invalidIds, setInvalidIds] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: clientList, mutate, getExportClientList } = useClientList();

  useEffect(() => {
    const validIds = clientList.filter((c) => c.isValid).map((c) => c.clientId);

    if (validIds.length > 0) {
      setRawIds(validIds.join("\n"));
    }
  }, [clientList]);

  const handleRawIdsChange = useCallback(
    (value: string) => {
      setRawIds(value);
      if (hasValidated) setHasValidated(false);
    },
    [hasValidated]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text");
      const target = e.currentTarget;
      const { selectionStart, selectionEnd, value } = target;
      const merged = value.slice(0, selectionStart) + pasted + value.slice(selectionEnd);
      const organized = normalizeIds(merged).join("\n");
      handleRawIdsChange(organized);
    },
    [handleRawIdsChange]
  );

  const handleValidate = useCallback(async () => {
    const ids = normalizeIds(rawIds);

    if (ids.length === 0) return;

    setIsValidating(true);
    try {
      const result = await validateClients(ids);
      const valid = result.filter((c) => c.status === "FOUND");
      const invalid = result.filter((c) => c.status === "NOT_FOUND").map((c) => c.clientId);

      setValidClients(valid);
      setInvalidIds(invalid);
      setHasValidated(true);
      onValidatedCountChange(valid.length);
      message.success(t("validationDone", { valid: valid.length, invalid: invalid.length }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t("validateError");
      message.error(errorMsg);
    } finally {
      setIsValidating(false);
    }
  }, [rawIds, onValidatedCountChange, mutate, t]);

  const handleClear = useCallback(() => {
    setRawIds("");
    setHasValidated(false);
    setValidClients([]);
    setInvalidIds([]);
    onValidatedCountChange(0);
  }, [onValidatedCountChange]);

  const handleDownloadReport = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await getExportClientList();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "validation-report.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t("downloadError");
      message.error(errorMsg);
    } finally {
      setIsExporting(false);
    }
  }, [getExportClientList, t]);

  return (
    <section className="cp-card px-[18px] py-[14px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-[#141414] text-white flex items-center justify-center text-[13px] font-bold">
          2
        </div>
        <Text strong className="text-[15px]">
          {t("title")}
        </Text>
        <Users size={16} className="text-gray-400 ml-1" />
      </div>

      <Flex gap={12}>
        <textarea
          value={rawIds}
          onChange={(e) => handleRawIdsChange(e.target.value)}
          onPaste={handlePaste}
          placeholder={t("placeholder")}
          className="recipientsTextarea flex-1 font-mono"
        />
        <Flex vertical gap={8}>
          <Button
            type="primary"
            onClick={rawIds.trim() ? handleValidate : undefined}
            icon={<CheckCircle2 size={16} />}
            className="bg-[#141414] border-[#141414] hover:bg-[#2a2a2a]"
            loading={isValidating}
            style={{
              ...(!rawIds.trim() && {
                opacity: 0.4,
                pointerEvents: "none"
              })
            }}
          >
            {t("validate")}
          </Button>
          {hasValidated && (
            <Button onClick={handleClear} icon={<X size={16} />} className="!bg-[#fafafa]">
              {tCommon("actions.clear")}
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
              {t("found", { count: validClients.length })}
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
                {t("notFound", { count: invalidIds.length })}
              </Tag>
            )}
            <Text type="secondary" className="text-[13px]">
              {t("ofTotal", { total: validClients.length + invalidIds.length })}
            </Text>
          </Flex>
          <Button
            size="small"
            onClick={handleDownloadReport}
            icon={<FileDown size={14} />}
            className="!bg-[#fafafa] !font-medium !text-[13px]"
            style={{ height: 31 }}
            loading={isExporting}
          >
            {t("downloadReport")}
          </Button>
        </Flex>
      )}
    </section>
  );
}
