import { ReactNode, useEffect, useRef, useState } from "react";
import Draggable, { ControlPosition, DraggableData, DraggableEvent } from "react-draggable";
import { getAppZoom } from "@/utils/utils";
import { NewspaperClipping } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";

import styles from "./DraggableTotalModal.module.scss";

interface Props {
  totalAmount: number;
  itemName: string;
  count: number;
  icon?: ReactNode;
  initialPosition?: ControlPosition;
}

export const DraggableTotalModal = ({
  totalAmount,
  itemName,
  count,
  icon,
  initialPosition
}: Props) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const draggleRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const [defaultPosition, setDefaultPosition] = useState(initialPosition ?? { x: 0, y: -160 });

  const updateDefaultPosition = () => {
    const modalWidth = draggleRef.current?.offsetWidth || 240;
    setDefaultPosition({ x: window.innerWidth / getAppZoom() - modalWidth - 20, y: 0 });
  };

  useEffect(() => {
    updateDefaultPosition();
    window.addEventListener("resize", updateDefaultPosition);
    return () => window.removeEventListener("resize", updateDefaultPosition);
  }, []);

  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    // rect/client sizes are screen px; Draggable works in (zoomed) CSS px
    const zoom = getAppZoom();
    setBounds({
      left: -targetRect.left / zoom + uiData.x,
      right: (clientWidth - targetRect.right) / zoom + uiData.x,
      top: -targetRect.top / zoom + uiData.y,
      bottom: (clientHeight - targetRect.bottom) / zoom + uiData.y
    });
  };

  return (
    <Draggable
      scale={getAppZoom()}
      bounds={bounds}
      nodeRef={draggleRef}
      onStart={(event, uiData) => onStart(event, uiData)}
      defaultClassName={styles.modal}
      defaultPosition={defaultPosition}
    >
      <div ref={draggleRef}>
        <p className={styles.modal__title}>Total</p>
        <p className={styles.modal__total}>{formatMoney(totalAmount.toString())}</p>
        <div className={styles.modal__count}>
          {icon ?? <NewspaperClipping size={16} />}
          <p>
            {itemName} <strong>{count}</strong>
          </p>
        </div>
      </div>
    </Draggable>
  );
};
