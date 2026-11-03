"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { downloadDigitalRecordFilesFromToken } from "@/services/chat/clients";
import { Toaster } from "@/modules/chat/ui/toaster";
import { toast } from "@/modules/chat/hooks/use-toast";
import { useTranslations } from "use-intl";

interface IDecodedPayload {
  data: {
    fileName: string;
    url: string;
  }[];
  ia: number;
  exp: number;
}

export default function PortalArchivosPage() {
  const t = useTranslations("publicPortals.filePortal");
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
              title: t("downloadStarted"),
              description: t("downloading", { fileName: file.fileName })
            });
          } else {
            failed += 1;
            toast({
              title: t("downloadError"),
              description: t("singleUseLink", { fileName: file.fileName }),
              variant: "destructive"
            });
          }
        } catch (error) {
          failed += 1;
          toast({
            title: t("downloadError"),
            description: t("unexpectedError", { fileName: file.fileName }),
            variant: "destructive"
          });
        }
      }

      if (downloaded && failed === 0) {
        toast({
          title: t("downloadCompleted"),
          description: t("filesDownloaded", { count: downloaded })
        });
      }
    };

    fetchFiles();
  }, [fileToken, payload?.data]);

  if (!fileToken) {
    return <p>{t("missingToken")}</p>;
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-lg shadow p-8 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
          <ul className="w-full space-y-4">
            {payload?.data?.map((file) => (
              <li key={file.fileName} className="w-full flex flex-col items-center">
                <p>{file.fileName}</p>
              </li>
            ))}
          </ul>
          <h2 className="mt-3 text-xl font-bold text-center">
            {t.rich("acceptReminder", {
              u: (chunks) => <span className="underline text-black">{chunks}</span>
            })}
          </h2>
        </div>
      </div>

      <Toaster />
    </>
  );
}
