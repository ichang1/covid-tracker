import React, { useState } from "react";
import Select, { StylesConfig } from "react-select";
import { randAlphaNum } from "../../utils/misc";
import styles from "../../styles/CustomSelect.module.css";

export type Option = {
  value: string;
  label: string;
};

interface CustomSelectProps {
  options: Option[];
  setValue: (value: string) => void;
  isMulti: boolean;
}

const customStyles: StylesConfig<Option, boolean> = {
  menu: (provided, state) => ({
    ...provided,
    width: state.selectProps.width,
    borderBottom: "1px dotted black",
  }),
  option: (provided, state) => ({
    ...provided,
    borderBottom: "1px dotted black",
    color: state.isSelected ? "white" : "black",
    padding: 5,
  }),
  control: (provided, { selectProps: { width } }) => ({
    ...provided,
    width: width,
  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = "opacity 300ms";

    return { ...provided, opacity, transition };
  },
  noOptionsMessage: (provided, state) => {
    return { ...provided };
  },
};

export default function CustomSelect({
  options,
  setValue,
  isMulti,
}: CustomSelectProps) {
  const [selectValue, setSelectValue] = useState<Option | null>(null);

  const handleChange = (option: any) => {
    const { value = null } = option;
    setValue(value);
    setSelectValue(option);
  };

  return (
    <>
      <Select
        className={styles["custom-select"]}
        options={options}
        value={selectValue}
        instanceId={`custom-select-${randAlphaNum(3)}`}
        onChange={handleChange}
        styles={customStyles}
        backspaceRemovesValue={false}
        noOptionsMessage={(e) => (e.inputValue ? "No options" : null)}
        isMulti={isMulti}
      />
    </>
  );
}
