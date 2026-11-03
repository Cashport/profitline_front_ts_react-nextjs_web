"use client";

import React, { useState } from "react";
import { message } from "antd";
import { useTranslations } from "use-intl";
import { VOID_REASONS, VOID_REASON_OTHER } from "../../constants/voidReasons";
import { anularPrecintos } from "@/services/precintos/precintos";

interface AnularPrecintosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  precintosSeleccionados: string[];
}

export const AnularPrecintosModal: React.FC<AnularPrecintosModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  precintosSeleccionados = []
}) => {
  const t = useTranslations("seals.voidModal");
  const tm = useTranslations("seals.modals");
  const tCommon = useTranslations("common");
  const tReasons = useTranslations("seals.voidReasons");
  const [motivo, setMotivo] = useState("");
  const [observacion, setObservacion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnular = async () => {
    try {
      setIsLoading(true);
      setErrorModal(null);

      if (precintosSeleccionados.length === 0) throw new Error(tm("noSealsSelected"));
      if (!motivo) throw new Error(t("reasonRequired"));
      if (motivo === VOID_REASON_OTHER && !observacion.trim()) {
        throw new Error(t("otherNeedsObservation"));
      }

      await anularPrecintos(precintosSeleccionados, motivo, observacion);

      message.success(t("success", { count: precintosSeleccionados.length }));
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      setErrorModal(errorMsg);
      message.error(tm("errorWithMessage", { message: errorMsg }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        <div className="p-6 pb-4 flex items-start justify-between border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#e6007e] flex items-center justify-center text-white">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">{t("title")}</h3>
              <p className="text-[13px] text-gray-400 mt-0.5">
                {precintosSeleccionados.slice(0, 3).join(", ")}
                {precintosSeleccionados.length > 3 &&
                  ` ${tm("andMore", { count: precintosSeleccionados.length - 3 })}`}{" "}
                · {tm("sealsTotal", { count: precintosSeleccionados.length })} ·{" "}
                {t("cannotReassign")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Motivo */}
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-gray-900">
              {t("reason")} <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  {t("selectReason")}
                </option>
                {VOID_REASONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {tReasons(m.key)}
                  </option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 text-[13px]">
                ▼
              </span>
            </div>
          </div>

          {/* Observación */}
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-gray-900">
              {t("observation")}{" "}
              {motivo === VOID_REASON_OTHER ? (
                <span className="text-pink-500">*</span>
              ) : (
                <span className="text-gray-400 font-normal">{tm("optional")}</span>
              )}
            </label>
            <textarea
              rows={3}
              placeholder={
                motivo === VOID_REASON_OTHER ? t("otherPlaceholder") : t("defaultPlaceholder")
              }
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-black resize-none"
            />
          </div>

          {errorModal && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-[13px] font-medium p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
              <span className="text-yellow-500 text-sm">⚠️</span>
              <div>{errorModal}</div>
            </div>
          )}
        </div>

        <div className="p-5 px-6 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-[13px] text-gray-400 font-medium">{t("ready")}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-[13px] font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {tCommon("actions.cancel")}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleAnular}
              className={`px-6 py-2.5 text-[13px] font-bold rounded-xl transition-colors cursor-pointer ${!isLoading ? "bg-[#e6007e] text-white hover:bg-[#c2006a] shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            >
              {isLoading ? t("submitting") : t("submit", { count: precintosSeleccionados.length })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
