export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  actor?: string;
  timestamp: string;
  type: "status_change" | "approval" | "rejection" | "comment" | "system";
  metadata?: Record<string, any>;
}
