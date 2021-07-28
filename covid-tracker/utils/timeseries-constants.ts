export const BLUE = "#8884d8";
export const GREEN = "#82ca9d";
export const RED = "#E7625F";

const today = new Date();

function getDateYesterday(date = new Date()) {
  let d = date;
  d.setDate(d.getDate() - 1);
  return d;
}

function dateParts(date: Date) {
  const year = date.getFullYear();
  const day = date.getDate();
  const month = date.getMonth() + 1;

  const yearStr = `${year}`;
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  return {
    year,
    day,
    month,
    yearStr,
    dayStr,
    monthStr,
  };
}

export function YYYYMMDD_MMDDYYYY(date: string) {
  const [yearStr, monthStr, dayStr] = date.split("-");
  return `${monthStr}-${dayStr}-${yearStr}`;
}

function dateToNumber(date: string) {
  //date: MM-DD-YYYY
  const [month, day, year] = date.split("-").map((num) => parseInt(num));
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  //YYYYMMMDDDD
  return parseInt(`${year}${monthStr}${dayStr}`);
}
interface Data {
  [key: string]: {
    [key: string]: number;
  };
}
export function formatData(data: Data) {
  const keys = Object.keys(data);
  const dates = Object.keys(data[keys[0]]);
  const datesSorted = dates.sort(
    (date1, date2) => dateToNumber(date1) - dateToNumber(date2)
  );
  const formattedData = datesSorted.map((date) => {
    const dateData = keys.reduce(
      (_dateData, key) => ({ ..._dateData, [`${key}`]: data[key][date] }),
      {}
    );
    return { ...dateData, date };
  });
  return formattedData;
}

export const MIN_COVID_DATE = "2020-01-22";
export const MIN_VACCINE_DATE = "2020-12-01";

const { yearStr, dayStr, monthStr } = dateParts(getDateYesterday(today));

const yesterday = `${yearStr}-${monthStr}-${dayStr}`;

export const MAX_COVID_DATE = yesterday;
export const MAX_VACCINE_DATE = yesterday;
