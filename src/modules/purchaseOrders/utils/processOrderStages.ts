import type { IPurchaseOrderTracking } from "@/types/purchaseOrders/purchaseOrders";
import type { OrderStage, SubValidation } from "../components/purchase-order-process/purchase-order-process";
import { formatDateAndTime } from "@/utils/utils";

/**
 * Get the latest tracking event from an array of events
 * @param events - Array of tracking events
 * @returns The most recent event or null if array is empty
 */
export function getLatestTrackingEvent(
  events: IPurchaseOrderTracking[]
): IPurchaseOrderTracking | null {
  if (!events || events.length === 0) {
    return null;
  }

  // Sort by created_at descending and return the first (most recent)
  return events.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  })[0];
}

/**
 * Merge API tracking data with static order stages
 * @param staticStages - Array of static order stage configurations
 * @param tracking - Array of tracking events from the API
 * @returns Array of order stages with completion data and subValidations populated
 */
export function mergeTrackingWithStages(
  staticStages: OrderStage[],
  tracking: IPurchaseOrderTracking[]
): OrderStage[] {
  if (!tracking || tracking.length === 0) {
    return staticStages;
  }

  // Agrupar todos los eventos por step_id
  const trackingByStepId = new Map<number, IPurchaseOrderTracking[]>();

  tracking.forEach((event) => {
    const events = trackingByStepId.get(event.step_id) || [];
    events.push(event);
    trackingByStepId.set(event.step_id, events);
  });

  // Merge tracking data into static stages
  return staticStages.map((stage) => {
    const trackingEvents = trackingByStepId.get(stage.id);

    if (!trackingEvents || trackingEvents.length === 0) {
      // No tracking data for this stage, return as-is
      return stage;
    }

    // Convertir todos los eventos a SubValidations
    const subValidations: SubValidation[] = trackingEvents
      .map((event) => ({
        name: event.event_description,
        completedBy: event.created_by_name,
        createdAt: formatDateAndTime(event.created_at),
        isCompleted: event.is_step_complete === 1
      }))
      .sort((a, b) => {
        // Ordenar por fecha descendente (más reciente primero)
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

    // Encontrar el evento completado más reciente para el stage
    const completedEvents = trackingEvents
      .filter((e) => e.is_step_complete === 1)
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

    const latestCompleted = completedEvents[0];

    return {
      ...stage,
      completedBy: latestCompleted ? latestCompleted.created_by_name : null,
      completedAt: latestCompleted ? formatDateAndTime(latestCompleted.created_at) : null,
      subValidations
    };
  });
}

/**
 * Determine the current stage based on tracking data
 * Returns the highest step_id reached in the tracking array
 * @param stages - Array of order stages with completion data
 * @returns The ID of the current stage (1-5)
 */
export function getCurrentStage(stages: OrderStage[]): number {
  // Find the maximum step_id that has been reached
  // All stages up to and including this one should be highlighted
  let maxStepId = 1;

  stages.forEach((stage) => {
    // If the stage has any subvalidations, it has been reached
    if (stage.subValidations && stage.subValidations.length > 0) {
      if (stage.id > maxStepId) {
        maxStepId = stage.id;
      }
    }
  });

  return maxStepId;
}
