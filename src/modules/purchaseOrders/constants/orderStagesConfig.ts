import { ClipboardList, CheckCircle, Receipt, Truck, Package } from "lucide-react";
import type { OrderStage } from "../components/purchase-order-process/purchase-order-process";

/**
 * Static configuration for purchase order stages
 * Icons and order are fixed, completion data will be populated from API tracking
 * `name` is the i18n key under purchaseOrders.stages
 */
export const ORDER_STAGES_CONFIG: OrderStage[] = [
  {
    id: 1,
    name: "purchaseOrder",
    icon: ClipboardList,
    completedBy: null,
    completedAt: null
  },
  {
    id: 2,
    name: "validations",
    icon: CheckCircle,
    completedBy: null,
    completedAt: null
    // TODO: Process subValidations when API provides approval tracking data
    // subValidations: []
  },
  {
    id: 3,
    name: "invoiced",
    icon: Receipt,
    completedBy: null,
    completedAt: null
  },
  {
    id: 4,
    name: "inDispatch",
    icon: Truck,
    completedBy: null,
    completedAt: null
  },
  {
    id: 5,
    name: "delivered",
    icon: Package,
    completedBy: null,
    completedAt: null
  }
];
