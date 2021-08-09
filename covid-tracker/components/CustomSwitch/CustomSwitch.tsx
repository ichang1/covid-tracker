import React from "react";
import Switch from "react-switch";
import styles from "../../styles/CustomSwitch.module.css";

interface CustomSwitchProps {
  label: string;
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomSwitch = ({ label, state, setState }: CustomSwitchProps) => {
  return (
    <div className={styles["switch-container"]}>
      <Switch
        onChange={() => {
          setState((state) => !state);
        }}
        checked={state}
        checkedIcon={false}
        uncheckedIcon={false}
      />
      <span className={styles["switch-label"]}>{label}</span>
    </div>
  );
};

export default CustomSwitch;
