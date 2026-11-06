import { redirect } from "next/navigation";

/** Enlace de los correos: abre el ticket sobre la vista de Soporte. */
export default function SupportTicketPage({ params }: { params: { id: string } }) {
  redirect(`/support?ticket=${encodeURIComponent(params.id)}`);
}
