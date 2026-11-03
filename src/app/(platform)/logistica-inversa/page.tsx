import { redirect } from "next/navigation";

// The legacy entry point — funnel visitors to the default tab so the URL still
// resolves to a real reverse-logistics page.
export default function LogisticaInversaIndexPage() {
  redirect("/logistica-inversa/devoluciones");
}