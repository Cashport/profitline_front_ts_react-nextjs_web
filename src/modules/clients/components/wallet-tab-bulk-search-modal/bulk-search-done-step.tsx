import { Button } from "antd";
import { Check } from "phosphor-react";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { IBulkAction } from "./types";

interface Props {
  action: IBulkAction;
  /** Lo que hizo la acción, p. ej. "Se radicaron 120 facturas." */
  message: string;
  onAnotherAction: () => void;
  onClose: () => void;
}

const BulkSearchDoneStep = ({ action, message, onAnotherAction, onClose }: Props) => (
  <div className="flex flex-1 items-center justify-center p-6">
    <div className="flex w-[440px] max-w-full flex-col items-center gap-2.5 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
        <Check size={22} weight="bold" />
      </span>
      <span className="text-[17px] font-semibold">{action.label} completado</span>
      <span className="text-xs text-muted-foreground">{message}</span>

      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button size="large" onClick={onAnotherAction}>
          Otra acción
        </Button>
        <PrincipalButton onClick={onClose}>Cerrar</PrincipalButton>
      </div>
    </div>
  </div>
);

export default BulkSearchDoneStep;
