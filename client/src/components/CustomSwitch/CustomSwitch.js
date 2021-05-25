import React from "react";
import Switch from "react-switch";

const CustomSwitch = ({ label, state, setState }) => {
  return (
    <label>
      <span>{label}</span>
      <Switch
        onChange={() => {
          setState(!state);
        }}
        checked={state}
        checkedIcon={false}
        uncheckedIcon={false}
      />
    </label>
  );
};

export default CustomSwitch;
