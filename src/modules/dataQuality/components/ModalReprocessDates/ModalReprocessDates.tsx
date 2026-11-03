import { useEffect, useMemo, useState } from "react";
import { Modal, Radio, message } from "antd";
import { CaretLeft } from "@phosphor-icons/react";
import dayjs, { Dayjs } from "dayjs";

import { reprocessArchiveDates } from "@/services/dataQuality/dataQuality";
import { ApiError } from "@/utils/api/api";
import { InputDate } from "@/components/atoms/inputs/InputDate/InputDate";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import {
  buildReprocessPayload,
  formatReprocessDisplayDate,
  getCurrentMonthEnd,
  getCurrentMonthStart,
  getReprocessErrorDetail,
  getReprocessFromDate
} from "../../utils/reprocessArchiveDates";
import { TReprocessStartFrom } from "@/types/dataQuality/IDataQuality";

import "./modalReprocessDates.scss";

interface ModalReprocessDatesProps {
  isOpen: boolean;
  onClose: () => void;
  /** id del cliente en el módulo de datos (de la ruta) → id_client_data */
  clientId: string;
  onSuccess?: () => void;
}

const ModalReprocessDates = ({
  isOpen,
  onClose,
  clientId,
  onSuccess
}: ModalReprocessDatesProps) => {
  const [startFrom, setStartFrom] = useState<TReprocessStartFrom>("month_start");
  const [date, setDate] = useState<Dayjs | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // El rango se calcula al abrir el modal para que no cambie si el mes pasa con el modal abierto.
  const { monthStart, monthEnd } = useMemo(() => {
    const today = dayjs();
    return { monthStart: getCurrentMonthStart(today), monthEnd: getCurrentMonthEnd(today) };
  }, [isOpen]);

  const resetState = () => {
    setStartFrom("month_start");
    setDate(undefined);
  };

  useEffect(() => {
    if (!isOpen) resetState();
  }, [isOpen]);

  const fromDate = getReprocessFromDate(startFrom, date, monthStart);
  const isRangeValid = Boolean(fromDate);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleReprocess = async () => {
    if (!isRangeValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload =
        startFrom === "month_start"
          ? buildReprocessPayload({ startFrom, idClientData: Number(clientId) })
          : buildReprocessPayload({ startFrom, idClientData: Number(clientId), date: date! });

      await reprocessArchiveDates(payload);

      // El "hasta" es el último día del mes calculado localmente, no el toDate de la
      // respuesta, que es un límite superior exclusivo.
      message.success(
        `Reproceso solicitado del ${formatReprocessDisplayDate(
          fromDate!
        )} al ${formatReprocessDisplayDate(monthEnd)}.`
      );
      resetState();
      onSuccess?.();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(getReprocessErrorDetail(error.message, error.data));
      } else {
        message.error(error instanceof Error ? error.message : "Error al reprocesar las fechas");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      className="modalReprocessDates"
      width={460}
      footer={null}
      open={isOpen}
      closable={false}
      maskClosable={false}
      onCancel={handleClose}
    >
      <button className="modalReprocessDates__header" onClick={handleClose} aria-label="Volver">
        <CaretLeft size="1.25rem" />
        <h4>Reprocesar fechas</h4>
      </button>

      <div className="modalReprocessDates__form">
        <div className="modalReprocessDates__field">
          <p className="modalReprocessDates__label" id="reprocess-type-label">
            Tipo de reproceso
          </p>
          <Radio.Group
            className="modalReprocessDates__options"
            aria-labelledby="reprocess-type-label"
            value={startFrom}
            onChange={(event) => setStartFrom(event.target.value as TReprocessStartFrom)}
          >
            <Radio className="modalReprocessDates__option" value="month_start">
              Inicio de mes
            </Radio>
            <Radio className="modalReprocessDates__option" value="specific_date">
              Fecha específica
            </Radio>
          </Radio.Group>
        </div>

        {startFrom === "specific_date" && (
          <InputDate
            titleInput="Fecha"
            placeholder="Seleccionar fecha"
            value={date}
            onChange={(value) => setDate(value ?? undefined)}
            minDate={monthStart}
            maxDate={monthEnd}
          />
        )}

        <p className="modalReprocessDates__summary">
          {isRangeValid
            ? `Se reprocesará del ${formatReprocessDisplayDate(
                fromDate!
              )} al ${formatReprocessDisplayDate(monthEnd)}.`
            : "Selecciona la fecha desde la que se reprocesará."}
        </p>
      </div>

      <FooterButtons
        handleOk={handleReprocess}
        onClose={handleClose}
        titleConfirm="Reprocesar"
        isConfirmLoading={isSubmitting}
        isConfirmDisabled={!isRangeValid}
      />
    </Modal>
  );
};

export default ModalReprocessDates;
