export function formatTime(iso: string): string {
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "p. m." : "a. m.";
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
