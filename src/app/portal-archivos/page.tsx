"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { downloadDigitalRecordFilesFromToken } from "@/services/chat/clients";

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
  const fileToken = searchParams.get("fileToken");

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

      for (const file of payload.data) {
        const response = await downloadDigitalRecordFilesFromToken(file.url, fileToken);
      }
    };

    fetchFiles();
  }, [fileToken]);

  if (!fileToken) {
    return <p>No file token provided</p>;
  }

  return (
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
  );
}
