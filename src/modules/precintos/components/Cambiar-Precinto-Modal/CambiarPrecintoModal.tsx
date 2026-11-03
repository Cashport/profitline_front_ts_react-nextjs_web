"use client";

import React, { useState, useEffect } from "react";
import { message } from "antd";
import { useTranslations } from "use-intl";
import { cambiarEjecutivo, getFilterExecutives } from "@/services/precintos/precintos";

interface CambiarPrecintoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  precintosSeleccionados: string[];
  ejecutivoActualId?: string | null; // 👈 NUEVA PROP
}

interface Ejecutivo {
  Id: string;
  UserName: string;
}

export const CambiarPrecintoModal: React.FC<CambiarPrecintoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  precintosSeleccionados = [],
  ejecutivoActualId = null
}) => {
  const t = useTranslations("seals.changeModal");
  const tm = useTranslations("seals.modals");
  const tCommon = useTranslations("common");
  const [ejecutivo, setEjecutivo] = useState("");
  const [fecha, setFecha] = useState("");
  const [guia, setGuia] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ejecutivosList, setEjecutivosList] = useState<Ejecutivo[]>([]);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      setFecha(today);
      setEjecutivo("");
      setGuia("");
      setErrorModal(null);

      const fetchEjecutivos = async () => {
        try {
          const data = await getFilterExecutives();
          setEjecutivosList(data.data || data);
        } catch (error) {
          console.error("Error cargando ejecutivos", error);
        }
      };
      fetchEjecutivos();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCambiar = async () => {
    try {
      setIsLoading(true);
      setErrorModal(null);

      if (precintosSeleccionados.length === 0) throw new Error(tm("noSealsSelected"));
      if (!ejecutivo) throw new Error(tm("repRequired"));
      if (ejecutivo === ejecutivoActualId) throw new Error(t("alreadyOwner"));

      const response = await cambiarEjecutivo(precintosSeleccionados, ejecutivo, fecha, guia);

      // 👇 Tolerante a distintas formas de respuesta
      const omitidos = response?.data?.omitidos || response?.omitidos || [];
      const count = response?.data?.count || response?.count || 0;

      if (omitidos.length > 0) {
        const msg = response?.message || t("skipped", { count: omitidos.length });
        message.warning(msg, 6);
        setErrorModal(msg);
        if (count > 0) onSuccess();
        return;
      }

      message.success(t("success", { count: precintosSeleccionados.length }));
      onSuccess();
    } catch (error: any) {
      let errorMsg = error.response?.data?.message || error.message;

      if (errorMsg.includes("Profit360 rechazó el cambio: 400") || error.response?.status === 400) {
        errorMsg = t("selectedAlreadyOwner");
      }

      setErrorModal(errorMsg);
      message.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        <div className="p-6 pb-4 flex items-start justify-between border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#f4fbc5] border border-[#c2f012]/50 flex items-center justify-center text-lime-800">
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
                <path d="M16 3h5v5" />
                <path d="M4 20L21 3" />
                <path d="M21 16v5h-5" />
                <path d="M15 15l6 6" />
                <path d="M4 4l5 5" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">{t("title")}</h3>
              <p className="text-[13px] text-gray-400 mt-0.5">{t("subtitle")}</p>
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
          <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 text-[13px] font-semibold text-gray-800">
            <span className="font-extrabold text-gray-900">{tm("sealsLabel")}</span>{" "}
            {precintosSeleccionados.slice(0, 5).join(", ")}
            {precintosSeleccionados.length > 5 &&
              ` ${tm("andMore", { count: precintosSeleccionados.length - 5 })}`}{" "}
            · {tm("sealsTotal", { count: precintosSeleccionados.length })}
          </div>

          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-gray-900">{t("changeTo")}</label>
            <div className="relative">
              <select
                value={ejecutivo}
                onChange={(e) => setEjecutivo(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  {tm("selectRepPlaceholder")}
                </option>

                {/* 👇 DESHABILITAMOS AL DUEÑO ACTUAL 👇 */}
                {ejecutivosList.map((exec) => {
                  const esElActual = exec.Id === ejecutivoActualId;
                  return (
                    <option
                      key={exec.Id}
                      value={exec.Id}
                      disabled={esElActual}
                      className={esElActual ? "text-gray-300 bg-gray-100" : ""}
                    >
                      {exec.UserName} {esElActual ? t("current") : ""}
                    </option>
                  );
                })}
              </select>
              <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 text-[13px]">
                ▼
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100">
            <label className="block text-[13px] font-bold text-gray-900">
              {tm("transferDetail")}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">
                  {tm("date")}
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">
                  {tm("trackingNote")}{" "}
                  <span className="text-gray-400 font-normal">{tm("optional")}</span>
                </label>
                <input
                  type="text"
                  placeholder={tm("trackingPlaceholder")}
                  value={guia}
                  onChange={(e) => setGuia(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {errorModal && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-[13px] font-medium p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
              <span className="text-yellow-500 text-sm">⚠️</span>
              <div>{errorModal}</div>
            </div>
          )}
        </div>

        <div className="p-5 px-6 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-[13px] text-gray-400 font-medium">
            {!ejecutivo ? tm("selectTheRep") : t("ready")}
          </span>
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
              disabled={!ejecutivo || isLoading}
              onClick={handleCambiar}
              className={`px-6 py-2.5 text-[13px] font-bold rounded-xl transition-colors cursor-pointer ${ejecutivo && !isLoading ? "bg-[#c2f012] text-black hover:bg-[#b0dc0e] shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            >
              {isLoading ? t("submitting") : t("submit", { count: precintosSeleccionados.length })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
