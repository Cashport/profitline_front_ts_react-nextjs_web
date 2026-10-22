"use client";

import ProfitLoader from "@/components/ui/profit-loader";

interface ReportViewerProps {
  title: string;
  /** HTML completo del informe; undefined mientras llega. */
  html?: string;
  isLoading: boolean;
  error?: Error;
}

/**
 * Pinta el HTML del informe tal cual llega, dentro de un iframe para que sus
 * estilos no se mezclen con los de la app. El sandbox deja correr sus scripts
 * (gráficas, interacciones) pero sin allow-same-origin: el documento queda en
 * un origen opaco y no puede leer la sesión ni el DOM de Cashport.
 * Ojo: un srcdoc hereda la CSP de la app (middleware.ts), así que los recursos
 * externos que use el informe tienen que estar permitidos allí.
 */
export default function ReportViewer({ title, html, isLoading, error }: ReportViewerProps) {
  return (
    <div className="flex min-h-[60vh] flex-1 overflow-hidden rounded-2xl bg-card shadow-sm">
      {html !== undefined ? (
        <iframe
          title={title}
          srcDoc={html}
          sandbox="allow-scripts"
          className="block h-full w-full flex-1 border-0 bg-white"
        />
      ) : (
        <div className="flex flex-1 items-center justify-center p-9">
          {isLoading ? (
            <ProfitLoader size="small" />
          ) : (
            <p className="text-center text-sm text-destructive">
              {error?.message || "No se pudo cargar el informe."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
