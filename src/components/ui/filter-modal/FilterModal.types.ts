import type { ReactNode } from "react";

/** A selectable option inside a filter category. */
export type FilterOptionItem = { id: string; name: string };

/** Committed/draft selection: category key -> selected items. */
export type FilterSelection = Record<string, FilterOptionItem[]>;

/** Async loading state for categories whose options are fetched on demand. */
export type FilterCategoryStatus = "idle" | "loading" | "loaded" | "error";

export type FilterCategoryConfig = {
  key: string;
  label: string;
  /** "multi" toggles items; "single" replaces the selection. Default "multi". */
  selectMode?: "multi" | "single";
  /** "options" renders the standard list; "custom" delegates to renderPanel. Default "options". */
  kind?: "options" | "custom";
  /** Options for kind "options". */
  options?: FilterOptionItem[];
  /** Overrides the left "{n} resultados" meta text (e.g. "Selecciona un periodo"). */
  metaLabel?: string;
  /** Async state for lazily-loaded categories. Absent is treated as "loaded". */
  status?: FilterCategoryStatus;
  /** Optional content rendered above the options list (e.g. a placeholder box). */
  renderAboveOptions?: () => ReactNode;
  /** Full modal content for kind "custom" (e.g. a date-range panel). */
  renderPanel?: () => ReactNode;
  /** Sidebar badge count for a custom category. */
  draftCount?: number;
  /** Committed active-tag node for a custom category (null when nothing selected). */
  renderTag?: () => ReactNode | null;
};

export interface FilterModalProps {
  categories: FilterCategoryConfig[];
  /** Committed selection; seeds the draft each time the modal opens. */
  value: FilterSelection;
  /** Commit the modal draft (wrappers also commit their own custom draft, e.g. dates). */
  onApply: (selection: FilterSelection) => void;
  /** Commit a committed-option change made outside the modal (tag removal / clear-all). */
  onValueChange: (next: FilterSelection) => void;
  /** Full reset of committed state, including custom categories. Falls back to onValueChange. */
  onClearAll?: () => void;
  /** Fired when the modal opens, so wrappers can reset custom drafts (e.g. dates). */
  onOpen?: () => void;
  /** Fired when the in-modal "Limpiar todo" runs, so wrappers can reset custom drafts. */
  onClearDraft?: () => void;
  /** Fired when a category becomes active, for lazy option loading. */
  onCategoryOpen?: (key: string) => void;
  /** Fired when the user retries a category that failed to load. */
  onRetryCategory?: (key: string) => void;
  /** Overrides the active-tag value text for option categories. */
  formatTagValue?: (cat: FilterCategoryConfig, items: FilterOptionItem[]) => string;
  /** Disables the trigger button. */
  isLoading?: boolean;
  /** Small trigger tweaks for visual parity with the original components. */
  trigger?: { label?: string; className?: string; showChevron?: boolean };
  /** Optional content rendered at the end of the trigger/tags bar (e.g. a theme toggle). */
  barEnd?: ReactNode;
}
