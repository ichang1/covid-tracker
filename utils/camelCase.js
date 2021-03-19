const capitalizeWords = (s) => {
  const parts = s.split(" ");
  parts.map((w) => {
    return capitalize(w);
  });
};

const capitalize = (w) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
export default camelCase;
