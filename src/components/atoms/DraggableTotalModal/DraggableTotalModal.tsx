import { ReactNode, useEffect, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { NewspaperClipping } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";

import styles from "./DraggableTotalModal.module.scss";

interface Props {
  totalAmount: number;
  itemName: string;
  count: number;
  icon?: ReactNode;
}

export const DraggableTotalModal = ({ totalAmount, itemName, count, icon }: Props) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const draggleRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const [defaultPosition, setDefaultPosition] = useState({ x: 0, y: -160 });

  const updateDefaultPosition = () => {
    const modalWidth = draggleRef.current?.offsetWidth || 240;
    setDefaultPosition({ x: window.innerWidth - modalWidth - 20, y: 0 });
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
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y)
    });
  };

  return (
    <Draggable
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
