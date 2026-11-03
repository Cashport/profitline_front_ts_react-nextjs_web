import { notFound } from "next/navigation";

// Con varios layouts raíz (landing y app) Next no puede usar un not-found
// global: esta ruta comodín manda cualquier URL desconocida al not-found de
// la app.
export default function CatchAll() {
  notFound();
}
