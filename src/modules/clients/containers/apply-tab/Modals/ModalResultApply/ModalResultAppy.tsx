import { useEffect, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { Collapse, Flex } from "antd";

import { useAppStore } from "@/lib/store/store";

import "./modalResultAppy.scss";

const { Panel } = Collapse;

interface Props {
  invoices?: number;
  desconts?: number;
  payments?: number;
  total?: number;
  defaultPosition?: { x: number; y: number };
}

export const ModalResultAppy = ({
  invoices,
  desconts,
  payments,
  total,
  defaultPosition: defaultPositionProp
}: Props) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const updateDefaultPosition = () => {
    const modalWidth = draggleRef.current?.offsetWidth || 240;
    setDefaultPosition({ x: window.innerWidth - modalWidth - 20, y: 0 });
  };

  useEffect(() => {
    updateDefaultPosition();
    window.addEventListener("resize", updateDefaultPosition);
    return () => window.removeEventListener("resize", updateDefaultPosition);
  }, []);

  const draggleRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const [defaultPosition, setDefaultPosition] = useState(
    defaultPositionProp ?? { x: 0, y: -160 }
  );

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
      defaultClassName="modal__apply__panel"
      defaultPosition={defaultPosition}
    >
      <div ref={draggleRef} className="draggableModal">
        <Collapse
          ghost
          defaultActiveKey={["1"]}
          expandIconPosition="end"
          className="custom-collapse"
        >
          <Panel header="Resumen" key="1" className="custom-panel">
            <Flex vertical gap="0.3rem">
              <Flex justify="space-between" className="facturas">
                <div>Facturas</div>
                <div className={invoices === 0 ? "no-value" : ""}>
                  {invoices === 0 ? "-" : formatMoney(invoices)}
                </div>
              </Flex>
              <Flex justify="space-between" className="pagos">
                <div>Pagos</div>
                <div>{formatMoney(payments)}</div>
              </Flex>
              <Flex justify="space-between" className="descuentos">
                <div>Descuentos</div>
                <div className={desconts === 0 ? "no-value" : ""}>
                  {desconts === 0 ? "-" : formatMoney(desconts)}
                </div>
              </Flex>
            </Flex>
          </Panel>
        </Collapse>
        <Flex justify="space-between" className="divider__conciliation saldo">
          <div>Saldo</div>
          <div>{formatMoney(total)}</div>
        </Flex>
      </div>
    </Draggable>
  );
};
