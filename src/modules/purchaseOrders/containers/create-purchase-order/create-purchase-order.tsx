"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { FileText, GripVertical } from "lucide-react";

import { useResizablePanel } from "../../hooks/useResizablePanel";
import { useAppStore } from "@/lib/store/store";

import { Card, CardContent } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import { Separator } from "@/modules/chat/ui/separator";
import { PurchaseOrderInfo } from "../../components/purchase-order-info/purchase-order-info";
import { PurchaseOrderProducts } from "../../components/purchase-order-products/purchase-order-products";
import { PurchaseOrderDocument } from "../../components/purchase-order-document/purchase-order-document";
import { PurchaseOrderDetailHeader } from "../../components/purchase-order-detail-header/purchase-order-detail-header";

import { PurchaseOrderInfoFormData, PurchaseOrderProductsFormData } from "../../types/forms";
import { createPurchaseOrderBulk } from "@/services/purchaseOrders/purchaseOrders";
import { ICreatePurchaseOrder } from "@/types/purchaseOrders/purchaseOrders";

interface FileFormState {
  info: PurchaseOrderInfoFormData | null;
  products: PurchaseOrderProductsFormData | null;
  clientId?: string;
}

export function CreatePurchaseOrder() {
  const router = useRouter();
  const { pdfWidth, isPdfCollapsed, containerRef, handleMouseDown, expandPdf, collapsePdf } =
    useResizablePanel();

  const createFiles = useAppStore((state) => state.createFiles);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Independent form state per file
  const formStatesRef = useRef<Map<number, FileFormState>>(new Map());

  // Current file's live state (updated continuously by child callbacks)
  const infoDataRef = useRef<PurchaseOrderInfoFormData | null>(null);
  const productsDataRef = useRef<PurchaseOrderProductsFormData | null>(null);
  const clientIdRef = useRef<string | undefined>();
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();

  // Create objectURL for the active file's PDF preview
  const [fileUrl, setFileUrl] = useState<string | undefined>();

  useEffect(() => {
    const file = createFiles[activeFileIndex];
    if (!file || !(file instanceof File)) {
      setFileUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [activeFileIndex, createFiles]);

  // Save current file's state into the map
  const saveCurrentFileState = useCallback(() => {
    formStatesRef.current.set(activeFileIndex, {
      info: infoDataRef.current,
      products: productsDataRef.current,
      clientId: clientIdRef.current
    });
  }, [activeFileIndex]);

  // Get saved state for a file index (used as initial data on mount)
  const getSavedInfo = useCallback(
    () => formStatesRef.current.get(activeFileIndex)?.info ?? undefined,
    [activeFileIndex]
  );

  const getSavedProducts = useCallback(
    () => formStatesRef.current.get(activeFileIndex)?.products ?? undefined,
    [activeFileIndex]
  );

  const handleFileChange = useCallback(
    (index: number) => {
      if (index === activeFileIndex) return;
      // Save current file's live state
      saveCurrentFileState();

      // Load the target file's saved state into refs
      const savedState = formStatesRef.current.get(index);
      infoDataRef.current = savedState?.info ?? null;
      productsDataRef.current = savedState?.products ?? null;
      clientIdRef.current = savedState?.clientId;
      setSelectedClientId(savedState?.clientId);

      setActiveFileIndex(index);
    },
    [activeFileIndex, saveCurrentFileState]
  );

  // Continuous info form change handler
  const handleInfoChange = useCallback((data: PurchaseOrderInfoFormData) => {
    infoDataRef.current = data;
  }, []);

  const handleInfoSubmit = useCallback((data: PurchaseOrderInfoFormData) => {
    infoDataRef.current = data;
  }, []);

  const handleProductsChange = useCallback((products: PurchaseOrderProductsFormData) => {
    productsDataRef.current = products;
  }, []);

  const handleClientChange = useCallback((clientId: string) => {
    clientIdRef.current = clientId;
    setSelectedClientId(clientId);
  }, []);

  const handleCreateOrder = async () => {
    // Save the active file's current state first
    saveCurrentFileState();

    // Build purchase_orders array from all files' form states
    const purchaseOrders: ICreatePurchaseOrder[] = [];
    for (let i = 0; i < createFiles.length; i++) {
      const state = formStatesRef.current.get(i);
      if (!state?.info?.purchase_order_number) {
        message.warning(`Archivo "${createFiles[i].name}": falta el número de orden de compra`);
        return;
      }
      if (!state.clientId) {
        message.warning(`Archivo "${createFiles[i].name}": falta seleccionar un cliente`);
        return;
      }
      if (!state.products?.products?.length) {
        message.warning(`Archivo "${createFiles[i].name}": debe tener al menos un producto`);
        return;
      }

      purchaseOrders.push({
        client_id: state.clientId,
        purchase_order_number: state.info.purchase_order_number,
        total: 0,
        delivery_date: state.info.delivery_date ?? "",
        order_date: state.info.order_date ?? "",
        observations: state.info.observations ?? "",
        usage_channel_id: state.info.usage_channel_id ?? 0,
        products: state.products.products.map((p) => ({
          id: p.product_id ?? 0,
          description: p.product_description,
          quantity: p.quantity,
          price: p.unit_price,
          taxes: p.tax_amount
        }))
      });
    }

    setIsSubmitting(true);
    try {
      const renamedFiles = createFiles.map((file, i) => {
        const ext = file.name.substring(file.name.lastIndexOf("."));
        const newName = purchaseOrders[i].purchase_order_number + ext;
        return new File([file], newName, { type: file.type });
      });

      console.log("Payload for API:", {
        client_id: selectedClientId,
        purchaseOrders
      });
      console.log("Renamed files:", renamedFiles);

      await createPurchaseOrderBulk(renamedFiles, {
        client_id: selectedClientId || "",
        purchaseOrder: purchaseOrders
      });
      message.success("Órdenes de compra creadas correctamente");
      router.push("/purchase-orders");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al crear las órdenes de compra"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cashport-gray-lighter">
      <Card className="bg-cashport-white border-0 shadow-sm pt-0">
        <CardContent className="px-6 pb-6 pt-6">
          <PurchaseOrderDetailHeader
            isCreating
            files={createFiles}
            activeFileIndex={activeFileIndex}
            onFileChange={handleFileChange}
          />

          <PurchaseOrderInfo
            key={activeFileIndex}
            isCreating
            isEditMode={true}
            initialFormData={getSavedInfo()}
            onChange={handleInfoChange}
            onSubmit={handleInfoSubmit}
            onCancel={() => router.push("/purchase-orders")}
            onClientChange={handleClientChange}
          />

          <Separator className="mb-6" />

          <div ref={containerRef} className="flex gap-4 overflow-hidden">
            <PurchaseOrderProducts
              key={activeFileIndex}
              isCreating
              initialProductsData={getSavedProducts()}
              isPdfCollapsed={isPdfCollapsed}
              pdfWidth={pdfWidth}
              clientId={selectedClientId}
              onProductsChange={handleProductsChange}
            />

            {!isPdfCollapsed && (
              <div
                className="w-px bg-cashport-gray-light hover:bg-cashport-green cursor-col-resize flex items-center justify-center group transition-colors duration-200 flex-shrink-0"
                onMouseDown={handleMouseDown}
              >
                <GripVertical className="h-6 w-6 text-cashport-gray-light group-hover:text-cashport-green transition-colors duration-200" />
              </div>
            )}

            {!isPdfCollapsed && (
              <PurchaseOrderDocument
                fileUrl={fileUrl}
                pdfWidth={pdfWidth}
                onCollapse={collapsePdf}
              />
            )}
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleCreateOrder}
              disabled={isSubmitting}
              className="bg-cashport-green hover:bg-cashport-green/90 text-cashport-black font-semibold px-6"
            >
              {isSubmitting ? "Creando..." : "Crear Orden de Compra"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isPdfCollapsed && (
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
          <Button
            onClick={expandPdf}
            className="bg-cashport-green hover:bg-cashport-green/90 text-cashport-black rounded-l-lg rounded-r-none px-3 py-8 shadow-lg flex flex-col items-center justify-center"
          >
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">PDF</span>
          </Button>
        </div>
      )}
    </div>
  );
}
