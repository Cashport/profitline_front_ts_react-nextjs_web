"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { downloadDigitalRecordFilesFromToken } from "@/services/chat/clients";
import type { IDigitalRecordFile } from "@/types/chat/IChat";

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
  const [responses, setResponses] = useState<Record<string, IDigitalRecordFile[] | null>>({});

  if (!fileToken) {
    return <p>No file token provided</p>;
  }

  const payload: IDecodedPayload | undefined = JSON.parse(atob(fileToken?.split(".")[1]));

  useEffect(() => {
    if (!fileToken || !payload?.data) return;

    const fetchFiles = async () => {
      for (const file of payload.data) {
        console.log(`Calling downloadDigitalRecordFilesFromToken for: ${file.fileName}`);
        const response = await downloadDigitalRecordFilesFromToken(file.url, fileToken);
        console.log(`Response for ${file.fileName}:`, response);

        setResponses((prev) => ({
          ...prev,
          [file.fileName]: response
        }));
      }
    };

    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileToken]);

  return (
    <>
      <h1>Archivos a descargar</h1>
      <ul>
        {payload?.data.map((file) => (
          <li key={file.fileName}>
            <strong>{file.fileName}</strong>
            {responses[file.fileName] && (
              <pre>{JSON.stringify(responses[file.fileName], null, 2)}</pre>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
