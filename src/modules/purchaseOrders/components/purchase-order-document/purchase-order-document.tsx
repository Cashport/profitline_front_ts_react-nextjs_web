import { useTranslations } from "use-intl";
import { Button } from "@/modules/chat/ui/button";
import { FileText, Download } from "lucide-react";
import { LoadError, Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { IPurchaseOrderDetail } from "@/types/purchaseOrders/purchaseOrders";

interface PurchaseOrderDocumentProps {
  data?: IPurchaseOrderDetail;
  fileUrl?: string;
  pdfWidth: number;
  onCollapse: () => void;
}

export function PurchaseOrderDocument({
  data,
  fileUrl,
  pdfWidth,
  onCollapse
}: PurchaseOrderDocumentProps) {
  const t = useTranslations("purchaseOrders.document");
  const tCommon = useTranslations("common");
  const pdfUrl = fileUrl ?? data?.document_url;
  const archivoOriginal = data?.document_name;
  const numeroFactura = data?.purchase_order_number;
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  };

  const renderError = (error: LoadError) => {
    let message = "";
    switch (error.name) {
      case "InvalidPDFException":
        message = t("errors.invalid");
        break;
      case "MissingPDFException":
        message = t("errors.missing");
        break;
      case "UnexpectedResponseException":
        message = t("errors.unexpectedResponse");
        break;
      default:
        message = t("errors.cannotLoad");
        break;
    }

    return (
      <div className="p-8 text-center h-full flex items-center justify-center">
        <div className="space-y-4">
          <FileText className="h-16 w-16 mx-auto text-cashport-green opacity-50" />
          <div>
            <p className="text-lg font-medium text-cashport-black mb-2">
              {t("previewUnavailable")}
            </p>
            <p className="text-sm text-muted-foreground mb-2">{message}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {archivoOriginal || `factura-${numeroFactura}.pdf`}
            </p>
            <Button
              onClick={handleDownloadPdf}
              className="bg-cashport-green hover:bg-cashport-green/90 text-cashport-black"
            >
              <Download className="h-4 w-4 mr-2" />
              {tCommon("actions.download")}
            </Button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div
      className="transition-all duration-300 ease-in-out min-w-0"
      style={{ flex: `0 0 calc(${pdfWidth}% - 1.5rem)` }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center text-lg font-semibold text-cashport-black">
            <FileText className="h-5 w-5 mr-2 text-cashport-green" />
            {t("title")}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={!pdfUrl}
              className="border-cashport-gray-light text-cashport-black hover:bg-cashport-white bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              {tCommon("actions.download")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollapse}
              className="text-cashport-black hover:bg-cashport-white"
              aria-label={tCommon("actions.close")}
            >
              ×
            </Button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          {pdfUrl ? (
            <div className="w-full h-full min-h-[400px] rounded-lg bg-cashport-gray-lighter flex flex-col">
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
                <div style={{ height: "750px" }}>
                  <Viewer
                    fileUrl={pdfUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    renderError={renderError}
                  />
                </div>
              </Worker>
            </div>
          ) : (
            <div className="bg-cashport-gray-lighter rounded-lg p-8 text-center h-full min-h-[400px] flex items-center justify-center">
              <div className="space-y-4">
                <FileText className="h-16 w-16 mx-auto text-cashport-green opacity-50" />
                <div>
                  <p className="text-lg font-medium text-cashport-black mb-2">{t("unavailable")}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {archivoOriginal || `factura-${numeroFactura}.pdf`}
                  </p>
                  <p className="text-[13px] text-muted-foreground">{t("pdfUnavailable")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { PurchaseOrderDocumentProps };
