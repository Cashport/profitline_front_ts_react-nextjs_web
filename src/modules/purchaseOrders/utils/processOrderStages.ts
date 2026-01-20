import type { IPurchaseOrderTracking } from "@/types/purchaseOrders/purchaseOrders";
import type { OrderStage } from "../components/purchase-order-process/purchase-order-process";
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
 * @returns Array of order stages with completion data populated
 */
export function mergeTrackingWithStages(
  staticStages: OrderStage[],
  tracking: IPurchaseOrderTracking[]
): OrderStage[] {
  if (!tracking || tracking.length === 0) {
    return staticStages;
  }

  // Create a map of step_id to the latest completed tracking event
  const trackingMap = new Map<number, IPurchaseOrderTracking>();

  // Filter for completed steps and group by step_id
  const completedTracking = tracking.filter((t) => t.is_step_complete === 1);

  completedTracking.forEach((event) => {
    const existingEvent = trackingMap.get(event.step_id);

    if (!existingEvent) {
      trackingMap.set(event.step_id, event);
    } else {
      // If multiple events for same step_id, keep the latest
      const existingDate = new Date(existingEvent.created_at).getTime();
      const currentDate = new Date(event.created_at).getTime();

      if (currentDate > existingDate) {
        trackingMap.set(event.step_id, event);
      }
    }
  });

  // Merge tracking data into static stages
  return staticStages.map((stage) => {
    const trackingEvent = trackingMap.get(stage.id);

    if (!trackingEvent) {
      // No tracking data for this stage, return as-is
      return stage;
    }

    // Populate completion data from tracking
    return {
      ...stage,
      completedBy: trackingEvent.created_by_name || "Sistema",
      completedAt: formatDateAndTime(trackingEvent.created_at)
    };
  });
}

/**
 * Determine the current stage based on completion data
 * @param stages - Array of order stages with completion data
 * @returns The ID of the current stage (1-5)
 */
export function getCurrentStage(stages: OrderStage[]): number {
  // Find the first stage that is not completed (completedBy is null)
  const firstIncomplete = stages.find((stage) => stage.completedBy === null);

  if (firstIncomplete) {
    return firstIncomplete.id;
  }

  // If all stages are complete, return the last stage id
  if (stages.length > 0) {
    return stages[stages.length - 1].id;
  }

  // Fallback to first stage
  return 1;
}
