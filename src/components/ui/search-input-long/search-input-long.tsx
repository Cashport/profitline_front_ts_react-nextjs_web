import React, { FC, useState } from "react";
import { MagnifyingGlass, X } from "phosphor-react";
import styles from "./search-input-long.module.scss";

interface UiSearchInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  value?: string;
  showBorder?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UiSearchInputLong: FC<UiSearchInputProps> = ({
  id = "ui-search-input",
  name,
  placeholder,
  className,
  value,
  showBorder = false,
  onChange
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  const handleClearClick = () => {
    setInputValue("");
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
        value={value || inputValue}
        onChange={handleInputChange}
      />
      {(inputValue || value) && (
        <button onClick={handleClearClick} className={styles.clearButton} aria-label="Clear input">
          <X weight="bold" />
        </button>
      )}
    </label>
  );
};

export default UiSearchInputLong;
