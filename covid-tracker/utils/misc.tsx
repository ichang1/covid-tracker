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

export function flagEmojiToPNG(
  flag: string,
  options: any = {}
): JSX.Element | null {
  if (flag.length === 0) {
    return null;
  }
  try {
    const countryCode = Array.from(flag, (codeUnit) => codeUnit.codePointAt(0))
      .map((char) => String.fromCharCode(char! - 127397).toLowerCase())
      .join("");
    return (
      <img
        {...options}
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt="flag"
        height="18px"
        width="25px"
      />
    );
  } catch (err) {
    return null;
  }
}

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000";
