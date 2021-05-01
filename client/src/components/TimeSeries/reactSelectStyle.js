export const customStyles = {
  menu: (provided, state) => ({
    ...provided,
    width: state.selectProps.width,
    borderBottom: "1px dotted pink",
    color: state.selectProps.menuColor,
    padding: 20,
  }),

  control: (provided, { selectProps: { width } }) => ({
    ...provided,
    width: width,
  }),

  singleValue: (provided, state) => ({
    ...provided,
  }),
};
