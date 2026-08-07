import { useEffect, useRef, useState } from "react";
import { Flex, Modal, Progress, Typography } from "antd";
import { FileArrowUp, FileXls } from "@phosphor-icons/react";

import "./upload-purchase-orders-progress-modal.scss";

const { Title, Text } = Typography;

interface Props {
  isOpen: boolean;
  file: File | null;
  onCancel: () => void;
}

// Duración total fake: 3 minutos (180s)
const TOTAL_DURATION_MS = 180_000;
const TICK_INTERVAL_MS = 200;
const MAX_PERCENT = 99;

// Curva ease-out cúbica: el progreso avanza rápido al principio y se
// realentiza al acercarse al 99%, evitando la sensación de "se colgó"
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const UploadPurchaseOrdersProgressModal = ({ isOpen, file, onCancel }: Props) => {
  const [progress, setProgress] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setSecondsElapsed(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const raw = Math.min(elapsed / TOTAL_DURATION_MS, 1);
      const eased = easeOutCubic(raw) * MAX_PERCENT;
      setProgress(eased);

      setSecondsElapsed(Math.floor(elapsed / 1000));
    }, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen]);

  const fileSizeKb = file ? (file.size / 1024).toFixed(2) : "0";

  return (
    <Modal
      className="uploadPurchaseOrdersProgressModal"
      open={isOpen}
      footer={null}
      closable={false}
      maskClosable={false}
      centered
      title={
        <Title className="uploadPurchaseOrdersProgressModal__title" level={4}>
          Procesando orden de compra
        </Title>
      }
    >
      <Flex vertical gap="1.25rem" align="center">
        <Flex align="center" gap="0.75rem" className="uploadPurchaseOrdersProgressModal__file">
          <FileXls size={28} weight="duotone" />
          <Flex vertical>
            <Text strong className="uploadPurchaseOrdersProgressModal__fileName">
              {file?.name ?? "archivo.xlsx"}
            </Text>
            <Text type="secondary" className="uploadPurchaseOrdersProgressModal__fileSize">
              {fileSizeKb} KB
            </Text>
          </Flex>
        </Flex>

        <Progress
          percent={Number(progress.toFixed(2))}
          status="active"
          strokeColor={{ from: "#cbe61e", to: "#32bbe5" }}
          trailColor="#eeeeee"
          strokeWidth={10}
        />

        <Flex justify="space-between" className="uploadPurchaseOrdersProgressModal__footer">
          <Text type="secondary">
            <FileArrowUp size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
            Esperando respuesta del servidor, por favor espere...
          </Text>
          <Text strong>{formatTime(secondsElapsed)}</Text>
        </Flex>

        <button
          type="button"
          className="uploadPurchaseOrdersProgressModal__cancel"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </Flex>
    </Modal>
  );
};
