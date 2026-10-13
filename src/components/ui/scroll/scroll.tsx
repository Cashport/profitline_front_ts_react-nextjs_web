import { cn } from "@/utils/utils";
import styles from "./scroll.module.scss";

interface ScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Scroll({ className, children, ...props }: ScrollProps) {
  return (
    <div className={cn(styles.scroll, className)} {...props}>
      {children}
    </div>
  );
}
