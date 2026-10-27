import { useEffect, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { getAppZoom } from "@/utils/utils";
import { Collapse, Flex } from "antd";

import { useAppStore } from "@/lib/store/store";

import "./modalEstimatedConcilation.scss";

const { Panel } = Collapse;

interface invoiceConcilation {
  amount: number;
  quantity: number;
}

interface Props {
  invoice: invoiceConcilation;
  notFoundInvoices: invoiceConcilation;
  differenceInvoices: invoiceConcilation;
}

export const ModalEstimatedConcilation = ({
  invoice,
  notFoundInvoices,
  differenceInvoices
}: Props) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const updateDefaultPosition = () => {
    const modalWidth = draggleRef.current?.offsetWidth || 240;
    setDefaultPosition({ x: window.innerWidth / getAppZoom() - modalWidth - 20, y: 0 });
  };

  useEffect(() => {
    updateDefaultPosition();
    window.addEventListener("resize", updateDefaultPosition);
    return () => window.removeEventListener("resize", updateDefaultPosition);
  }, []);

  const draggleRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const [defaultPosition, setDefaultPosition] = useState({ x: 0, y: -160 });

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
      defaultClassName="modal__concilation"
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
              <Flex justify="space-between" gap="1.5rem">
                <div>Facturas: ({invoice?.quantity})</div> {formatMoney(invoice?.amount.toString())}
              </Flex>
              <Flex justify="space-between" gap="1.5rem">
                <div>No encontradas: ({notFoundInvoices?.quantity})</div>{" "}
                {formatMoney(notFoundInvoices?.amount.toString())}{" "}
              </Flex>
              <Flex justify="space-between" gap="1.5rem" className="text__diference">
                <div>Con diferencia: ({differenceInvoices?.quantity})</div>{" "}
                {formatMoney(differenceInvoices?.amount.toString())}
              </Flex>
            </Flex>
          </Panel>
        </Collapse>
        <Flex justify="space-between" gap="1.5rem" className="divider__conciliation">
          <div>Total CP:</div>
          {formatMoney(invoice?.amount + notFoundInvoices?.amount + differenceInvoices?.amount)}
        </Flex>
      </div>
    </Draggable>
  );
};
