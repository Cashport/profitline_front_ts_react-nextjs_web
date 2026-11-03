"use client";

import dayjs from "dayjs";
import { MoreHorizontal } from "lucide-react";
import { Dropdown, Spin } from "antd";
import { useTranslations } from "use-intl";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/modules/chat/ui/table";
import { IReferenceFile } from "@/types/dataQuality/IDataQuality";
import {
  ReferenceCatalogs,
  formatBytesToMB,
  resolveReferenceOwnerLabel
} from "../../references/references.utils";
import { useReferenceScopeLabels } from "../../hooks/useReferenceScopeLabels";

interface ReferencesTableProps {
  references: IReferenceFile[];
  catalogs: ReferenceCatalogs;
  isLoading: boolean;
  isValidating?: boolean;
  busyId?: number | null;
  /** IDs que resuelven para el contexto (se marcan como "Efectiva"). */
  effectiveIds?: number[];
  // eslint-disable-next-line no-unused-vars
  onDetail: (reference: IReferenceFile) => void;
  // eslint-disable-next-line no-unused-vars
  onReplace: (reference: IReferenceFile) => void;
  // eslint-disable-next-line no-unused-vars
  onToggle: (reference: IReferenceFile) => void;
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "-";

export function ReferencesTable({
  references,
  catalogs,
  isLoading,
  isValidating,
  busyId,
  effectiveIds,
  onDetail,
  onReplace,
  onToggle
}: ReferencesTableProps) {
  const t = useTranslations("dataQuality.references.table");
  const tCommon = useTranslations("common");
  const scopeLabels = useReferenceScopeLabels();
  return (
    <Spin spinning={isLoading || !!isValidating}>
      <Table className="table-fixed">
        <TableHeader>
          <TableRow style={{ borderColor: "#DDDDDD" }}>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>{t("type")}</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>{t("scope")}</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>{t("owner")}</TableHead>
            <TableHead className="w-[90px]" style={{ color: "#141414", fontWeight: 600 }}>
              {t("version")}
            </TableHead>
            <TableHead className="w-[100px]" style={{ color: "#141414", fontWeight: 600 }}>
              {t("status")}
            </TableHead>
            <TableHead className="w-[150px]" style={{ color: "#141414", fontWeight: 600 }}>
              {t("updated")}
            </TableHead>
            <TableHead className="w-[70px]" style={{ color: "#141414", fontWeight: 600 }}>
              {t("actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading && references.length === 0 ? (
            <TableRow style={{ borderColor: "#DDDDDD" }}>
              <TableCell colSpan={7} className="py-10 text-center text-gray-500">
                {t("empty")}
              </TableCell>
            </TableRow>
          ) : (
            references.map((reference) => {
              const busy = busyId === reference.id;
              const ownerLabel = resolveReferenceOwnerLabel(
                reference,
                catalogs,
                scopeLabels.labels
              );
              return (
                <TableRow
                  key={reference.id}
                  className="hover:bg-gray-50"
                  style={{ borderColor: "#DDDDDD" }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: "#141414" }}>
                        {reference.reference_type}
                      </span>
                      {effectiveIds?.includes(reference.id) && (
                        <Badge
                          variant="secondary"
                          className="text-[13px]"
                          style={{ backgroundColor: "#DBEAFE", color: "#1D4ED8" }}
                        >
                          {t("effective")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell style={{ color: "#141414" }}>
                    {scopeLabels.label(reference.scope_level)}
                  </TableCell>
                  <TableCell className="overflow-hidden text-ellipsis" title={ownerLabel}>
                    <span style={{ color: "#141414" }}>{ownerLabel}</span>
                  </TableCell>
                  <TableCell style={{ color: "#141414" }}>v{reference.version}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="text-[13px]"
                      style={{
                        backgroundColor: reference.is_active === 1 ? "#DCFCE7" : "#F3F4F6",
                        color: reference.is_active === 1 ? "#166534" : "#6B7280"
                      }}
                    >
                      {reference.is_active === 1
                        ? tCommon("status.active")
                        : tCommon("status.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ color: "#141414" }}>
                    <div className="flex flex-col">
                      <span>{formatDate(reference.updated_at || reference.created_at)}</span>
                      <span className="text-[13px] text-gray-400">
                        {formatBytesToMB(reference.size_bytes)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="w-0">
                    <div className="flex items-center justify-end">
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "detail",
                              label: tCommon("actions.viewDetail"),
                              onClick: () => onDetail(reference)
                            },
                            {
                              key: "replace",
                              label: t("replaceFile"),
                              onClick: () => onReplace(reference),
                              disabled: busy
                            },
                            {
                              key: "toggle",
                              label: reference.is_active === 1 ? t("deactivate") : t("activate"),
                              onClick: () => onToggle(reference),
                              disabled: busy
                            }
                          ]
                        }}
                        trigger={["click"]}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-[#f7f7f7] border-[#DDDDDD] hover:bg-[#f7f7f7] hover:border-black p-1 !p-0 size-7"
                          disabled={busy}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Spin>
  );
}
