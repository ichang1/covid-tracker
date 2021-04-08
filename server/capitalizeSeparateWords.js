/**
 * Function separates and capitalizes each word of a given string.
 * Words are separated by a single hyphen. After, the words are
 * recombined in the same order to a single string with the words
 * separated by a single space
 * @param {String} s the string to capitalize all of its words
 */
const capitalizeSeparateWords = (s) => {
  const parts = s.split(" ");
  const newParts = parts.map((w) => capitalize(w));
  const newString = newParts.reduce((acc, s) => {
    if (acc.length == 0) {
      return s;
    } else {
      return `${acc} ${s}`;
    }
  }, "");
  return newString;
};

/**
 * Function capitalizes the first character of a given word
 * @param {String} w the word to capitalize
 * @returns capitalized word as a string
 */
const capitalize = (w) => {
  return w.charAt(0).toUpperCase() + w.slice(1);
};

export default capitalizeSeparateWords;
