"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { Modal } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "use-intl";
import { ClipboardList, Eye, Plus, Tag, Upload, X } from "lucide-react";
import { useMarketAdminClientLines } from "@/modules/marketAdmin/hooks/useMarketAdminClientLines";
import {
  IDiscountGroup,
  IDiscountGroupProduct,
  NewClientDiscountData
} from "@/types/marketAdmin/IMarketAdmin";
import DiscountGroupCard from "./DiscountGroupCard";

type Props = {
  clientId: string;
  saving: boolean;
  onClose: () => void;
  onSave: (data: NewClientDiscountData) => void;
};

const createDiscountGroup = (): IDiscountGroup => ({
  id: `g${Date.now()}`,
  discount: 0,
  units: 1,
  products: []
});

const isGroupValid = (g: IDiscountGroup) =>
  g.products.length > 0 && g.discount > 0 && g.discount <= 100 && g.units >= 1;

const dateInputClass =
  "w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors text-[#141414]";
const iconButtonClass =
  "w-9 h-9 flex items-center justify-center border border-[#DDDDDD] rounded-lg text-[#666666] hover:border-[#141414] hover:text-[#141414] transition-colors flex-shrink-0";

export default function ModalCreateDiscount({ clientId, saving, onClose, onSave }: Props) {
  const t = useTranslations("marketAdmin.clientDetail.createDiscount");
  const tCommon = useTranslations("common");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [groups, setGroups] = useState<IDiscountGroup[]>(() => [createDiscountGroup()]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: lines,
    isLoading: isLoadingLines,
    error: linesError
  } = useMarketAdminClientLines(clientId);

  const catalog = useMemo<IDiscountGroupProduct[]>(
    () =>
      lines.flatMap((line) =>
        line.products.map((p) => ({
          id: p.id,
          description: p.description,
          lineId: line.category_id,
          lineName: line.category
        }))
      ),
    [lines]
  );
  const lineOptions = useMemo(
    () => lines.map((line) => ({ label: line.category, value: line.category_id })),
    [lines]
  );
  const hasNoProducts = !isLoadingLines && (!!linesError || catalog.length === 0);

  const today = dayjs().format("YYYY-MM-DD");
  const totalProducts = groups.reduce((sum, g) => sum + g.products.length, 0);
  // El backend exige fin posterior al inicio (mínimo un día después).
  const isValid =
    !!startDate &&
    !!endDate &&
    endDate > startDate &&
    !!file &&
    groups.length > 0 &&
    groups.every(isGroupValid);

  const handleAddGroup = () => setGroups((prev) => [...prev, createDiscountGroup()]);

  const handleUpdateGroup = (group: IDiscountGroup) =>
    setGroups((prev) => prev.map((g) => (g.id === group.id ? group : g)));

  const handleRemoveGroup = (groupId: string) =>
    setGroups((prev) => prev.filter((g) => g.id !== groupId));

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    // Permite volver a elegir el mismo archivo después de quitarlo
    e.target.value = "";
  };

  const handleViewFile = () => {
    if (file) window.open(URL.createObjectURL(file), "_blank");
  };

  const handleSave = () => {
    if (!isValid || !file || saving) return;
    onSave({ startDate, endDate, file, groups });
  };

  return (
    <Modal
      open
      onCancel={onClose}
      centered
      width={860}
      title={
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
            <ClipboardList size={15} className="text-[#141414]" />
          </span>
          <div>
            <h2 className="text-base font-bold text-[#141414]">{t("title")}</h2>
            <p className="text-[13px] font-normal text-[#999999]">{t("subtitle")}</p>
          </div>
        </div>
      }
      styles={{ body: { maxHeight: "calc(65 * var(--vh))", overflowY: "auto" } }}
      footer={
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#999999]">
            {t("footerSummary", { groups: groups.length, products: totalProducts })}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-sm text-[#666666] px-4 py-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
            >
              {tCommon("actions.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid || saving}
              className="text-sm font-semibold bg-[#CBE71E] text-[#141414] px-5 py-2 rounded-lg hover:bg-[#b8d11a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? tCommon("status.sending") : t("submitForApproval")}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] font-bold text-[#141414] block mb-1.5">
              {t("validity")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="date"
                  aria-label={t("startDate")}
                  className={dateInputClass}
                  value={startDate}
                  min={today}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="text-[13px] text-[#999999] block mt-1">{t("start")}</span>
              </div>
              <div>
                <input
                  type="date"
                  aria-label={t("endDate")}
                  className={dateInputClass}
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <span className="text-[13px] text-[#999999] block mt-1">{t("end")}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="text-[13px] font-bold text-[#141414] block mb-1.5">
              {t("attachment")}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-2">
              <span
                className={`flex-1 text-sm truncate border border-[#DDDDDD] rounded-lg px-3 py-2.5 ${
                  file ? "text-[#141414]" : "text-[#BBBBBB]"
                }`}
              >
                {file ? file.name : t("noFile")}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={t("uploadFile")}
                aria-label={t("uploadFile")}
                className={iconButtonClass}
              >
                <Upload size={14} />
              </button>
              {file && (
                <>
                  <button
                    type="button"
                    onClick={handleViewFile}
                    title={t("viewFile")}
                    aria-label={t("viewFile")}
                    className={iconButtonClass}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    title={t("removeFile")}
                    aria-label={t("removeFile")}
                    className="w-9 h-9 flex items-center justify-center border border-[#DDDDDD] rounded-lg text-[#AAAAAA] hover:border-[#E53E3E] hover:text-[#E53E3E] transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-[#141414]">
              {t("discountGroups")}
              {totalProducts > 0 && (
                <span className="ml-1.5 text-[#999999] font-normal">
                  {t("productsCount", { count: totalProducts })}
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={handleAddGroup}
              disabled={hasNoProducts}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#141414] border border-[#DDDDDD] px-3.5 py-2 rounded-lg hover:border-[#141414] hover:bg-[#FAFAFA] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={12} /> {t("addGroup")}
            </button>
          </div>

          {hasNoProducts ? (
            <div className="text-center py-14 border border-dashed border-[#DDDDDD] rounded-xl bg-[#FAFAFA]">
              <p className="text-sm text-[#999999]">{t("noProducts")}</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 text-center py-14 border border-dashed border-[#DDDDDD] rounded-xl bg-[#FAFAFA]">
              <span className="w-10 h-10 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center">
                <Tag size={16} className="text-[#AAAAAA]" />
              </span>
              <p className="text-sm text-[#999999] max-w-sm px-4">{t("emptyHint")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {groups.map((group, idx) => (
                <DiscountGroupCard
                  key={group.id}
                  group={group}
                  index={idx}
                  catalog={catalog}
                  usedInOtherGroups={
                    new Set(
                      groups
                        .filter((g) => g.id !== group.id)
                        .flatMap((g) => g.products.map((p) => p.id))
                    )
                  }
                  lineOptions={lineOptions}
                  isLoadingLines={isLoadingLines}
                  onChange={handleUpdateGroup}
                  onRemove={() => handleRemoveGroup(group.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
