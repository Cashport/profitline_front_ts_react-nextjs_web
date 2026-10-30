import { cn } from "@/utils/utils";

import { initials } from "../../utils/branches";

/** Círculo gris con las iniciales del usuario. */
export default function UserAvatar({ name, muted }: { name: string; muted?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cp-muted text-[13px] font-semibold",
        muted ? "text-cp-ink-4" : "text-cp-ink"
      )}
    >
      {initials(name)}
    </span>
  );
}
