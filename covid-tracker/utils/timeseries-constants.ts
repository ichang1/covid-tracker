export const monthToNum = {
  January: 0,
  Feburary: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

export const monthOptions = [
  "January",
  "Feburary",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

export const MIN_COVID_DATE = "2020-01-22";
export const MIN_VACCINE_DATE = "2020-12-01";

const { yearStr, dayStr, monthStr } = dateParts(getDateYesterday(today));

const yesterday = `${yearStr}-${monthStr}-${dayStr}`;

export const MAX_COVID_DATE = yesterday;
export const MAX_VACCINE_DATE = yesterday;
