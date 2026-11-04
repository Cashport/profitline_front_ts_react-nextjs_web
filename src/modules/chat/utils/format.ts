import dayjs from "dayjs";
import { getTranslator } from "@/i18n/translator";

export function formatDateLabel(iso: string): string {
  const date = dayjs(iso).startOf("day");
  const today = dayjs().startOf("day");
  const diff = today.diff(date, "day");

  const t = getTranslator("chat");
  if (diff === 0) return t("format.today");
  if (diff === 1) return t("format.yesterday");
  return date.format("D MMM YYYY");
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const t = getTranslator("chat");
  const period = hours >= 12 ? t("format.pm") : t("format.am");
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

export function formatWhatsAppText(text: string): string {
  if (!text) return "";

  return text
    .replace(/_\*(.*?)\*_/g, "<b><i>$1</i></b>")
    .replace(/\*(.*?)\*/g, "<b>$1</b>")
    .replace(/_(.*?)_/g, "<i>$1</i>")
    .replace(/~(.*?)~/g, "<s>$1</s>")
    .replace(/```(.*?)```/g, "<code>$1</code>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br/>");
}
