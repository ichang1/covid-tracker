export function randAlphaNum(length: number) {
  const lowercaseMinCode = 97;
  const lowercaseMaxCode = 122;
  const uppercaseMinCode = 65;
  const uppercaseMaxCode = 90;
  const numMinCode = 48;
  const numMaxCode = 57;

  let s = "";
  const charTypes = ["lowercase", "uppercase", "numeric"];

  for (let i = 0; i < length; i++) {
    const charType = charTypes[randIntFromRange(0, charTypes.length)];
    let randChar;
    switch (charType) {
      case "lowercase":
        randChar = String.fromCharCode(
          randIntFromRange(lowercaseMinCode, lowercaseMaxCode)
        );
      case "uppercase":
        randChar = String.fromCharCode(
          randIntFromRange(uppercaseMinCode, uppercaseMaxCode)
        );
      case "numeric":
        randChar = String.fromCharCode(
          randIntFromRange(numMinCode, numMaxCode)
        );
      default:
        randChar = "_";
    }
    s += randChar;
  }
  return s;
}

function randIntFromRange(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
