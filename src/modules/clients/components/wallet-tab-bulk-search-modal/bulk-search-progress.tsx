import { Progress, Spin } from "antd";
import { Check } from "phosphor-react";

import { cn } from "@/utils/utils";

interface Props {
  title: string;
  /** De 0 a 100. */
  progress: number;
  /** Pasos que se van completando a medida que avanza el progreso. */
  stepLabels: string[];
}

const BulkSearchProgress = ({ title, progress, stepLabels }: Props) => {
  const isComplete = progress >= 100;
  const current = Math.min(stepLabels.length - 1, Math.floor(progress / (100 / stepLabels.length)));

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-[420px] max-w-full flex-col gap-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[15px] font-semibold">{title}</span>
          <span className="text-[13px] font-semibold tabular-nums">{Math.round(progress)}%</span>
        </div>
        <Progress
          percent={progress}
          showInfo={false}
          size="small"
          strokeColor="#CBE71E"
          trailColor="#ececec"
          className="!m-0"
        />

        <ul className="mt-1 flex flex-col gap-2">
          {stepLabels.map((label, index) => {
            const isDone = index < current || isComplete;
            const isActive = index === current && !isComplete;

            return (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-2.5 text-xs",
                  index <= current ? "text-foreground" : "text-[#9a9a9a]"
                )}
              >
                <span className="flex h-3.5 w-3.5 flex-none items-center justify-center">
                  {isDone ? (
                    <Check size={14} weight="bold" color="#7cb518" />
                  ) : isActive ? (
                    <Spin size="small" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d6d6d6]" />
                  )}
                </span>
                {label}
              </li>
            );
          })}
        </ul>

        <span className="text-[11px] text-[#8a8a8a]">
          Puedes cerrar esta ventana; te avisaremos cuando termine.
        </span>
      </div>
    </div>
  );
};

export default BulkSearchProgress;
