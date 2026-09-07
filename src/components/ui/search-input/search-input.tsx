import React, { FC, useState } from "react";
import { MagnifyingGlass, X } from "phosphor-react";
import styles from "./search-input.module.scss";

interface UiSearchInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  showBorder?: boolean;
  /**
   * Si se pasa, el input queda controlado por el padre. Sirve para tener dos
   * buscadores sobre la misma consulta sin que se desincronicen. Si se omite,
   * el componente mantiene su propio estado, como siempre.
   */
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UiSearchInput: FC<UiSearchInputProps> = ({
  id = "ui-search-input",
  name,
  placeholder,
  className,
  showBorder = false,
  value,
  onChange
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState("");
  const inputValue = isControlled ? value : internalValue;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  const handleClearClick = () => {
    if (!isControlled) setInternalValue("");
    if (onChange) {
      const event = {
        target: { value: "" }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  return (
    <label
      htmlFor={id}
      className={[styles.inputBox, showBorder && styles.bordered, className]
        .filter(Boolean)
        .join(" ")}
    >
      <MagnifyingGlass className={styles.icon} weight="bold" />
      <input
        type="text"
        id={id}
        name={name}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
      />
      {inputValue && (
        <button onClick={handleClearClick} className={styles.clearButton} aria-label="Clear input">
          <X weight="bold" />
        </button>
      )}
    </label>
  );
};

export default UiSearchInput;
