export const customStyles = {
  menu: (provided, state) => ({
    ...provided,
  }),

  control: (_, { selectProps: { width } }) => ({
    width: width,
  }),

  singleValue: (provided, state) => ({
    ...provided,
  }),
};
