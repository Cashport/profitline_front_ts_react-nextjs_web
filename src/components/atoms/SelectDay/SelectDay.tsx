import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import "./selectDay.scss";

type Option = {
  value: string;
  label: string;
};
type SelecDayProps = {
  value: Option[];
  // eslint-disable-next-line no-unused-vars
  onChange: (options: Option[]) => void;
  disabled?: boolean;
  readonly?: boolean;
};

export const SelectDay = ({ value, onChange, disabled, readonly }: SelecDayProps) => {
  const t = useTranslations("components.selectDay");
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(value);

  const handleSelected = (option: Option) => {
    if (disabled) return;
    if (readonly) return;
    if (selectedOptions?.some((selected) => selected.value === option.value)) {
      setSelectedOptions(selectedOptions?.filter((selected) => selected !== option));
      return;
    }
    setSelectedOptions([...selectedOptions, option]);
  };

  useEffect(() => {
    onChange(selectedOptions);
  }, [selectedOptions]);

  useEffect(() => {
    if (disabled) {
      setSelectedOptions([]);
      onChange([]);
    }
  }, [disabled]);

  return (
    <div className={`selectDayContainer`}>
      {selectDayOptions.map((option) => (
        <div
          className={`selectDayContainer__day ${selectedOptions.some((selected) => selected.value === option.value) ? "-selected" : ""} ${disabled ? "-disabled" : ""} ${readonly ? "-readOnly" : ""}`.trim()}
          onClick={() => handleSelected(option)}
          key={option.value}
        >
          <p className="selectDayContainer__day__label">
            {DAY_KEYS[option.value] ? t(DAY_KEYS[option.value]) : option.label}
          </p>
        </div>
      ))}
    </div>
  );
};

// `value` es el día que guarda el backend; la inicial visible se traduce por día.
const DAY_KEYS: Record<string, "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat"> = {
  Domingo: "sun",
  Lunes: "mon",
  Martes: "tue",
  Miércoles: "wed",
  Jueves: "thu",
  Viernes: "fri",
  Sábado: "sat"
};

export const selectDayOptions: Option[] = [
  { value: "Domingo", label: "D" },
  { value: "Lunes", label: "L" },
  { value: "Martes", label: "M" },
  { value: "Miércoles", label: "X" },
  { value: "Jueves", label: "J" },
  { value: "Viernes", label: "V" },
  { value: "Sábado", label: "S" }
];
