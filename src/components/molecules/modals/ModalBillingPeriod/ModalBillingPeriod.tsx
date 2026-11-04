import { Dispatch, SetStateAction, useCallback, useEffect, useReducer, useState } from "react";
import { Flex, InputNumber, Modal, Radio, RadioChangeEvent, Typography } from "antd";
import { useTranslations } from "use-intl";

import { SelectBillingPeriod } from "@/components/molecules/selects/clients/SelectBillingPeriod/SelectBillingPeriod";
import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";
import "./modalBillingPeriod.scss";

const { Text } = Typography;

// "order" y "day_of_week" se guardan en español (los envía el backend y se le devuelven así):
// solo se traduce lo que se muestra.
const BILLING_ORDERS = ["Primero", "Segundo", "Tercero", "Cuarto", "Ultimo"] as const;
const BILLING_DAYS = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo"
] as const;
type BillingPeriodT = ReturnType<typeof useTranslations<"modals.billingPeriod">>;
export const billingOrderLabel = (t: BillingPeriodT, value?: string) =>
  value && (BILLING_ORDERS as readonly string[]).includes(value)
    ? t(`orders.${value as (typeof BILLING_ORDERS)[number]}`)
    : value ?? "";
export const billingDayLabel = (t: BillingPeriodT, value?: string) =>
  value && (BILLING_DAYS as readonly string[]).includes(value)
    ? t(`days.${value as (typeof BILLING_DAYS)[number]}`)
    : value ?? "";

interface Props {
  isOpen: boolean;
  billingPeriod: IBillingPeriodForm | undefined;
  setIsBillingPeriodOpen: Dispatch<SetStateAction<boolean>>;
  setBillingPeriod: Dispatch<SetStateAction<IBillingPeriodForm | undefined>>;
}

interface State {
  order: string | undefined;
  dayOfWeek: string | undefined;
  day: number | undefined;
}

const initialState: State = {
  order: undefined,
  dayOfWeek: undefined,
  day: undefined
};

type Action =
  | { type: "SET_PERIOD"; payload: string | undefined }
  | { type: "SET_DAY_OF_WEEK"; payload: string | undefined }
  | { type: "SET_DAY"; payload: number | undefined };

const actionTypes = {
  SET_PERIOD: "SET_PERIOD",
  SET_DAY_OF_WEEK: "SET_DAY_OF_WEEK",
  SET_DAY: "SET_DAY"
} as const;

export const ModalBillingPeriod = ({
  isOpen,
  setIsBillingPeriodOpen,
  setBillingPeriod,
  billingPeriod
}: Props) => {
  const t = useTranslations("modals.billingPeriod");
  const tCommon = useTranslations("common");
  const [radioState, setRadioState] = useState<boolean | null>(null);
  const orderOptions = [...BILLING_ORDERS];
  const daysOptions = [...BILLING_DAYS];

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSetPeriod = useCallback((event: string) => {
    dispatch({ type: actionTypes.SET_PERIOD, payload: event });
  }, []);

  const handleSetDayOfWeek = useCallback((event: string) => {
    dispatch({ type: actionTypes.SET_DAY_OF_WEEK, payload: event });
  }, []);
  const handleSetDay = useCallback((event: number | undefined) => {
    const intEvent = Math.floor(event ?? 0);
    if (intEvent > 0 && intEvent < 31) {
      dispatch({ type: actionTypes.SET_DAY, payload: intEvent });
    } else {
      dispatch({ type: actionTypes.SET_DAY, payload: undefined });
    }
  }, []);

  const handle = (
    day: number | undefined,
    dayOfWeek: string | undefined,
    order: string | undefined
  ) => {
    dispatch({ type: actionTypes.SET_DAY_OF_WEEK, payload: dayOfWeek });
    dispatch({ type: actionTypes.SET_DAY, payload: day });
    dispatch({ type: actionTypes.SET_PERIOD, payload: order });
  };

  const onSaveChanges = () => {
    const { day, dayOfWeek, order } = state;
    setBillingPeriod({
      day_flag: radioState ? "true" : "false",
      order: !radioState ? order : undefined,
      day_of_week: !radioState ? dayOfWeek : undefined,
      day: !radioState ? undefined : day
    });
    setIsBillingPeriodOpen(false);
  };

  const onChangeSelectRadio = (e: RadioChangeEvent) => setRadioState(e.target.value);

  useEffect(() => {
    if (isOpen === true && billingPeriod) {
      const { day, order, day_of_week } = billingPeriod;
      setRadioState(billingPeriod.day_flag === "true");
      handle(day, day_of_week, order);
    }
  }, [isOpen]);
  const modalDisabled = () => {
    switch (true) {
      case radioState === true && state.day !== undefined:
        return false;
      case radioState === false && state.dayOfWeek !== undefined && state.order !== undefined:
        return false;
      default:
        return true;
    }
  };
  return (
    <Modal
      zIndex={3}
      open={isOpen}
      onCancel={() => setIsBillingPeriodOpen(false)}
      title={t("title")}
      okButtonProps={{
        className: "buttonOk",
        disabled: modalDisabled()
      }}
      cancelButtonProps={{
        className: "buttonCancel"
      }}
      okText={tCommon("actions.saveChanges")}
      cancelText={tCommon("actions.cancel")}
      className="modalBillingPeriod"
      onOk={onSaveChanges}
    >
      <Flex vertical>
        <Text>{t("selectCutoff")}</Text>
        <Radio.Group
          style={{
            padding: "1.2rem .5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            width: "100%"
          }}
          onChange={onChangeSelectRadio}
          value={radioState}
        >
          <Radio value={true}>
            <Flex align="center" gap="1rem" style={{ width: "100%" }}>
              <Flex justify="center" align="center">
                <Text className="textPre-input">{t("theDay")}</Text>
              </Flex>
              <Flex
                vertical={false}
                style={{ display: "flex", alignItems: "center" }}
                justify="start"
              >
                <InputNumber
                  value={state.day}
                  variant="borderless"
                  className="input"
                  placeholder="10"
                  max={30}
                  onChange={(e) => handleSetDay(e ? e : undefined)}
                />
              </Flex>
            </Flex>
          </Radio>
          <Radio value={false} style={{ width: "100%" }}>
            <Flex align="center" gap="1rem" style={{ width: "100%" }}>
              <Text className="textPre-input">{t("the")}</Text>
              <Flex style={{ width: "20rem", gap: "1rem" }}>
                {[
                  {
                    options: orderOptions,
                    placeHolder: billingOrderLabel(t, "Segundo"),
                    orderRadioValue: state.order,
                    setValueSelected: handleSetPeriod
                  },
                  {
                    options: daysOptions,
                    placeHolder: billingDayLabel(t, "Miercoles"),
                    orderRadioValue: state.dayOfWeek,
                    setValueSelected: handleSetDayOfWeek
                  }
                ].map((item) => (
                  <SelectBillingPeriod
                    key={item.placeHolder}
                    {...item}
                    disabled={radioState === true}
                  />
                ))}
              </Flex>
            </Flex>
          </Radio>
        </Radio.Group>

        <Text>
          {radioState === true
            ? t("startsOnDay", { day: state.day ?? "" })
            : t("startsOnWeekday", {
                order: billingOrderLabel(t, state.order),
                weekday: billingDayLabel(t, state.dayOfWeek)
              })}
        </Text>
      </Flex>
    </Modal>
  );
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.SET_PERIOD:
      return {
        ...state,
        order: action.payload
      };
    case actionTypes.SET_DAY_OF_WEEK:
      return {
        ...state,
        dayOfWeek: action.payload
      };
    case actionTypes.SET_DAY:
      return {
        ...state,
        day: action.payload
      };
    default:
      return state;
  }
};
