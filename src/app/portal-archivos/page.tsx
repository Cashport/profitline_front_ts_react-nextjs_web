"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { downloadDigitalRecordFilesFromToken } from "@/services/chat/clients";
import { Toaster } from "@/modules/chat/ui/toaster";
import { toast } from "@/modules/chat/hooks/use-toast";

interface IDecodedPayload {
  data: {
    fileName: string;
    url: string;
  }[];
  ia: number;
  exp: number;
}

export default function PortalArchivosPage() {
  const searchParams = useSearchParams();
  const fileToken = searchParams.get("fileToken") || searchParams.get("filesToken");

  let payload: IDecodedPayload | undefined = undefined;
  if (fileToken) {
    try {
      payload = JSON.parse(atob(fileToken.split(".")[1]));
    } catch (e) {
      console.error("Error decoding file token payload:", e);
    }
  }

  useEffect(() => {
    if (!fileToken || !payload?.data || !payload) return;

    const fetchFiles = async () => {
      if (!payload?.data) return;

      let downloaded = 0;
      let failed = 0;

      for (const file of payload.data) {
        try {
          const response = await downloadDigitalRecordFilesFromToken(
            file.url,
            file.fileName,
            fileToken
          );
          if (response) {
            downloaded += 1;
            toast({
              title: "Descarga iniciada",
              description: `Se está descargando ${file.fileName}`
            });
          } else {
            failed += 1;
            toast({
              title: "Error al descargar",
              description: `No se pudo descargar ${file.fileName}. Es un link de descarga unica.`,
              variant: "destructive"
            });
          }
        } catch (error) {
          failed += 1;
          toast({
            title: "Error al descargar",
            description: `No se pudo descargar ${file.fileName} debido a un error inesperado.`,
            variant: "destructive"
          });
        }
      }

      if (downloaded && failed === 0) {
        toast({
          title: "Descarga completada",
          description: `${downloaded} archivo${downloaded === 1 ? "" : "s"} descargado${downloaded === 1 ? "" : "s"}.`
        });
      }
    };

    fetchFiles();
  }, [fileToken, payload?.data]);

  if (!fileToken) {
    return <p>No file token provided</p>;
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-lg shadow p-8 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-6">Archivos a descargar</h1>
          <ul className="w-full space-y-4">
            {payload?.data?.map((file) => (
              <li key={file.fileName} className="w-full flex flex-col items-center">
                <p>{file.fileName}</p>
              </li>
            ))}
          </ul>
          <h2 className="mt-3 text-xl font-bold text-center">
            ¡Recuerda darle a <span className="underline text-black">aceptar descarga</span>!
          </h2>
        </div>
      </div>

      <Toaster />
    </>
  );
}
