import React, { useEffect, useState } from "react";
import "./TimeSeries.css";
import { customStyles } from "./reactSelectStyle";
import useWindowDimensions from "../../customHooks/useWindowDimensions";

import Select from "react-select";
import CustomSwitch from "../CustomSwitch/CustomSwitch";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
} from "recharts";

import { timeSeries } from "../../data/timeSeries";
import { vaccine } from "../../data/vaccine";

import axios from "axios";

const monthToNum = {
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

const monthOptions = [
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

const today = new Date();

const FIRST_YEAR_COVID = 2020;
const covidYearOptions = Array.from(
  new Array(today.getFullYear() - FIRST_YEAR_COVID + 1),
  (val, idx) => FIRST_YEAR_COVID + idx
);

const FIRST_YEAR_VACCINE = 2020;
const vaccineYearOptions = Array.from(
  new Array(today.getFullYear() - FIRST_YEAR_VACCINE + 1),
  (val, idx) => FIRST_YEAR_VACCINE + idx
);

const BLUE = "#8884d8";
const GREEN = "#82ca9d";
const RED = "#E7625F";

function parseUS_State(data) {
  const dates = Object.keys(data[0].timeline.cases);
  const parsedCases = {};
  const parsedDeaths = {};
  const parsedRecovered = {};
  data.forEach((countyData) => {
    const { cases, deaths, recovered } = countyData.timeline;
    //apparently recovered is not actually given in the api
    dates.forEach((date) => {
      if (Object.keys(parsedCases).includes(date)) {
        parsedCases[date] += cases[date];
      } else {
        parsedCases[date] = cases[date];
      }
      if (Object.keys(parsedDeaths).includes(date)) {
        parsedDeaths[date] += deaths[date];
      } else {
        parsedDeaths[date] = deaths[date];
      }
      if (recovered == undefined) {
        parsedRecovered[date] = 0;
      } else {
        if (Object.keys(parsedRecovered).includes(date)) {
          parsedRecovered[date] += recovered[date];
        } else {
          parsedRecovered[date] = recovered[date];
        }
      }
    });
  });
  return {
    cases: parsedCases,
    deaths: parsedDeaths,
    recovered: parsedRecovered,
  };
}

const TimeSeries = ({ place }) => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  // state for covid series plot

  const [{ covidSeriesData, covidSeriesDataLoading }, setCovidSeries] =
    useState({ covidSeriesData: null, covidSeriesDataLoading: true });

  const [
    { selectedCovidStartMonth, selectedCovidStartYear },
    setSelectedCovidStartDate,
  ] = useState({
    selectedCovidStartMonth: "January",
    selectedCovidStartYear: FIRST_YEAR_COVID,
  });

  const [
    { selectedCovidEndMonth, selectedCovidEndYear },
    setSelectedCovidEndDate,
  ] = useState({
    selectedCovidEndMonth: monthOptions[today.getMonth()],
    selectedCovidEndYear: today.getFullYear(),
  });

  const [cumulativeCovidSeries, setCumulativeCovidSeries] = useState(true);

  // state for vaccine series plot

  const [{ vaccineSeriesData, vaccineSeriesDataLoading }, setVaccineSeries] =
    useState({ vaccineSeriesData: null, vaccineSeriesDataLoading: true });

  const [
    { selectedVaccineStartMonth, selectedVaccineStartYear },
    setSelectedVaccineStartDate,
  ] = useState({
    selectedVaccineStartMonth: "December",
    selectedVaccineStartYear: FIRST_YEAR_VACCINE,
  });

  const [
    { selectedVaccineEndMonth, selectedVaccineEndYear },
    setSelectedVaccineEndDate,
  ] = useState({
    selectedVaccineEndMonth: monthOptions[today.getMonth()],
    selectedVaccineEndYear: today.getFullYear(),
  });

  const [cumulativeVaccineSeries, setCumulativeVaccineSeries] = useState(true);

  //=================================================================================
  // code pertaining to covid series plot

  useEffect(() => {
    //start month options might be limited based on year
    //make sure selected start month is still valid
    const selectedCovidStartMonthIdx = monthToNum[selectedCovidStartMonth];
    if (selectedCovidStartMonthIdx >= getCovidStartMonthOptions().length) {
      setSelectedCovidStartDate({
        selectedCovidStartMonth: "January",
        selectedCovidStartYear,
      });
    }
  }, [selectedCovidStartYear]);

  useEffect(() => {
    //end month options might be limited based on year
    //make sure selected end month is still valid
    const selectedCovidEndMonthIdx = monthToNum[selectedCovidEndMonth];
    if (selectedCovidEndMonthIdx >= getCovidEndMonthOptions().length) {
      const validEndMonths = getCovidEndMonthOptions();
      const lastValidEndMonth = validEndMonths[validEndMonths.length - 1];
      setSelectedCovidEndDate({
        selectedCovidEndMonth: lastValidEndMonth,
        selectedCovidEndYear,
      });
    }
  }, [selectedCovidEndYear]);

  useEffect(() => {
    if (Object.keys(timeSeries).includes(place) && covidSeriesDataLoading) {
      // get covid series data
      getCovidSeriesData();
    }
  }, [covidSeriesDataLoading]);

  const yearMonthToDecimal = (year, month) => {
    const monthIdx = monthToNum[month];
    const monthString = monthIdx < 10 ? `0${monthIdx}` : `${monthIdx}`;
    return parseFloat(`${year}.${monthString}`);
  };

  const filterCovidSeriesData = (parsedData) => {
    //filter data based on time range selected
    const { cases, deaths, recovered } = parsedData;

    const dateLowerBound = yearMonthToDecimal(
      selectedCovidStartYear,
      selectedCovidStartMonth
    );
    const dateUpperBound = yearMonthToDecimal(
      selectedCovidEndYear,
      selectedCovidEndMonth
    );
    const filteredCases = {};
    Object.entries(cases).forEach(([date, dateCases]) => {
      const dateParts = date.split("/");
      const month = parseInt(dateParts[0]) - 1;
      const year = parseInt(dateParts[2]) + 2000;
      const decimalFormat = yearMonthToDecimal(year, monthOptions[month]);
      if (dateLowerBound <= decimalFormat && decimalFormat <= dateUpperBound) {
        filteredCases[date] = dateCases;
      }
    });
    const filteredDeaths = {};
    Object.entries(deaths).forEach(([date, dateDeaths]) => {
      const dateParts = date.split("/");
      const month = parseInt(dateParts[0]) - 1;
      const year = parseInt(dateParts[2]) + 2000;
      const decimalFormat = yearMonthToDecimal(year, monthOptions[month]);
      if (dateLowerBound <= decimalFormat && decimalFormat <= dateUpperBound) {
        filteredDeaths[date] = dateDeaths;
      }
    });
    const filteredRecovered = {};
    Object.entries(recovered).forEach(([date, dateRecovered]) => {
      const dateParts = date.split("/");
      const month = parseInt(dateParts[0]) - 1;
      const year = parseInt(dateParts[2]) + 2000;
      const decimalFormat = yearMonthToDecimal(year, monthOptions[month]);
      if (dateLowerBound <= decimalFormat && decimalFormat <= dateUpperBound) {
        filteredRecovered[date] = dateRecovered;
      }
    });
    const filteredData = {
      cases: filteredCases,
      deaths: filteredDeaths,
      recovered: filteredRecovered,
    };
    return filteredData;
  };

  const getCovidSeriesData = async () => {
    const { api: url, US_State } = timeSeries[place];
    let parsedData;
    try {
      const res = await axios.get(url);
      const data = res.data;
      parsedData = US_State ? parseUS_State(data) : data.timeline;
    } catch (err) {
      parsedData = {};
    }
    const cumulativeCovidSeriesPlotPoints = getCovidSeriesPlotPoints(
      filterCovidSeriesData(parsedData)
    );
    const dailyCovidSeriesPlotPoints = getDailyCovidSeriesPlotPoints(
      cumulativeCovidSeriesPlotPoints
    );

    setCovidSeries({
      covidSeriesData: {
        cumulative: cumulativeCovidSeriesPlotPoints,
        daily: dailyCovidSeriesPlotPoints,
      },
      covidSeriesDataLoading: false,
    });
  };

  const getCovidSeriesPlotPoints = (filteredData) => {
    const { cases, deaths, recovered } = filteredData;
    const orderedDates = Object.keys(cases).sort((a, b) => {
      const aYear = a.split("/")[2] + 2000;
      const aMonthIdx = parseInt(a.split("/")[0]) - 1;
      const aMonth = monthOptions[aMonthIdx];
      const aDecimal = yearMonthToDecimal(aYear, aMonth);

      const bYear = b.split("/")[2] + 2000;
      const bMonthIdx = parseInt(b.split("/")[0]) - 1;
      const bMonth = monthOptions[bMonthIdx];
      const bDecimal = yearMonthToDecimal(bYear, bMonth);
      return aDecimal - bDecimal;
    });
    const data = orderedDates.map((date) => {
      const dateCases = cases[date];
      const dateDeaths = deaths[date];
      const dateRecovered = recovered[date];
      return {
        date,
        cases: dateCases,
        deaths: dateDeaths,
        recovered: dateRecovered,
      };
    });
    return data;
  };

  const getDailyCovidSeriesPlotPoints = (cumulativeData) => {
    let data = [];
    data.push(cumulativeData[0]);
    for (let i = 1; i < cumulativeData.length; i++) {
      const {
        cases: yesterdayTotalCases,
        deaths: yestedayTotalDeaths,
        recovered: yesterdayTotalRecovered,
      } = cumulativeData[i - 1];
      const {
        date: todayDate,
        cases: todayTotalCases,
        deaths: todayTotalDeaths,
        recovered: todayTotalRecovered,
      } = cumulativeData[i];
      const todayNewCases =
        todayTotalCases - yesterdayTotalCases >= 0
          ? todayTotalCases - yesterdayTotalCases
          : 0;
      const todayNewDeaths =
        todayTotalDeaths - yestedayTotalDeaths >= 0
          ? todayTotalDeaths - yestedayTotalDeaths
          : 0;
      const todayNewRecovered =
        todayTotalRecovered - yesterdayTotalRecovered >= 0
          ? todayTotalRecovered - yesterdayTotalRecovered
          : 0;
      data.push({
        date: todayDate,
        cases: todayNewCases,
        deaths: todayNewDeaths,
        recovered: todayNewRecovered,
      });
    }
    return data;
  };

  const getCovidStartMonthOptions = () => {
    if (selectedCovidStartYear === selectedCovidEndYear) {
      //start month cannot be later than the end month for same year
      const selectedCovidEndMonthIdx = monthToNum[selectedCovidEndMonth];
      return monthOptions.slice(0, selectedCovidEndMonthIdx + 1);
    } else {
      return monthOptions;
    }
  };

  const getCovidEndMonthOptions = () => {
    if (
      selectedCovidEndYear === selectedCovidStartYear &&
      selectedCovidEndYear === today.getFullYear()
    ) {
      //start and end on same year
      //same year is current year irl
      //valid months from selected start month to current month irl
      const selectedCovidStartMonthIdx = monthToNum[selectedCovidStartMonth];
      console.log(selectedCovidStartMonthIdx);
      return monthOptions.slice(
        selectedCovidStartMonthIdx,
        today.getMonth() + 1
      );
    } else if (selectedCovidEndYear === selectedCovidStartYear) {
      // end month cannot be earlier than start month for same year
      const selectedCovidStartMonthIdx = monthToNum[selectedCovidStartMonth];
      return monthOptions.slice(selectedCovidStartMonthIdx);
    } else if (selectedCovidEndYear === today.getFullYear()) {
      // end month cannot be later than current month irl
      return monthOptions.slice(0, today.getMonth() + 1);
    } else {
      return monthOptions;
    }
  };

  const getCovidStartYearOptions = () => {
    const selectedCovidEndYearIdx = selectedCovidEndYear - FIRST_YEAR_COVID;
    return covidYearOptions.slice(0, selectedCovidEndYearIdx + 1);
  };

  const getCovidEndYearOptions = () => {
    const selectedCovidStartYearIdx = selectedCovidStartYear - FIRST_YEAR_COVID;
    return covidYearOptions.slice(selectedCovidStartYearIdx);
  };

  const handleSelectCovidStartMonth = (e) => {
    const { value } = e;
    setSelectedCovidStartDate({
      selectedCovidStartMonth: value,
      selectedCovidStartYear,
    });
  };

  const handleSelectCovidEndMonth = (e) => {
    const { value } = e;
    setSelectedCovidEndDate({
      selectedCovidEndMonth: value,
      selectedCovidEndYear,
    });
  };

  const handleSelectCovidStartYear = (e) => {
    const { value } = e;
    setSelectedCovidStartDate({
      selectedCovidStartMonth,
      selectedCovidStartYear: value,
    });
  };

  const handleSelectCovidEndYear = (e) => {
    const { value } = e;
    setSelectedCovidEndDate({
      selectedCovidEndMonth,
      selectedCovidEndYear: value,
    });
  };

  const getCovidCaseTimeSeries = (e) => {
    e.preventDefault();
    setCovidSeries({ covidSeriesData: null, covidSeriesDataLoading: true });
  };

  //=========================================================================================
  // code pertaining to vaccine series plot

  useEffect(() => {
    //start month options might be limited based on year
    //make sure selected start month is still valid
    const selectedVaccineStartMonthIdx = monthToNum[selectedVaccineStartMonth];
    if (selectedVaccineStartMonthIdx >= getVaccineStartMonthOptions().length) {
      setSelectedVaccineStartDate({
        selectedVaccineStartMonth:
          selectedVaccineStartYear === FIRST_YEAR_VACCINE
            ? "December"
            : "January",
        selectedVaccineStartYear,
      });
    }
  }, [selectedVaccineStartYear]);

  useEffect(() => {
    //end month options might be limited based on year
    //make sure selected end month is still valid
    const selectedVaccineEndMonthIdx = monthToNum[selectedVaccineEndMonth];
    if (selectedVaccineEndMonthIdx >= getVaccineEndMonthOptions().length) {
      const validEndMonths = getVaccineEndMonthOptions();
      const lastValidEndMonth = validEndMonths[validEndMonths.length - 1];
      setSelectedVaccineEndDate({
        selectedVaccineEndMonth: lastValidEndMonth,
        selectedVaccineEndYear,
      });
    }
  }, [selectedVaccineEndYear]);

  useEffect(() => {
    if (Object.keys(timeSeries).includes(place) && vaccineSeriesDataLoading) {
      // get covid series data
      getVaccineSeriesData();
    }
  }, [vaccineSeriesDataLoading]);

  const filterVaccineSeriesData = (parsedData) => {
    //filter data based on time range selected

    const dateLowerBound = yearMonthToDecimal(
      selectedVaccineStartYear,
      selectedVaccineStartMonth
    );
    const dateUpperBound = yearMonthToDecimal(
      selectedVaccineEndYear,
      selectedVaccineEndMonth
    );

    const filtered = parsedData.filter((dateStats) => {
      const dateParts = dateStats.date.split("/");
      const month = parseInt(dateParts[0]) - 1;
      const year = parseInt(dateParts[2]) + 2000;
      const decimalFormat = yearMonthToDecimal(year, monthOptions[month]);
      return dateLowerBound <= decimalFormat && decimalFormat <= dateUpperBound;
    });

    return filtered;
  };

  const getVaccineSeriesData = async () => {
    const { api: url } = vaccine[place];
    let parsedData;
    try {
      const res = await axios.get(url);
      parsedData = res.data.timeline;
    } catch (err) {
      parsedData = {};
    }
    const vaccineData = getVaccineSeriesPlotPoints(
      filterVaccineSeriesData(parsedData)
    );

    const cumulativeVaccineSeriesPlotPoints = vaccineData.map(
      ({ total: doses, date }) => ({ doses, date })
    );

    const dailyVaccineSeriesPlotPoints = vaccineData.map(
      ({ daily: doses, date }) => ({ doses, date })
    );

    setVaccineSeries({
      vaccineSeriesData: {
        cumulative: cumulativeVaccineSeriesPlotPoints,
        daily: dailyVaccineSeriesPlotPoints,
      },
      vaccineSeriesDataLoading: false,
    });
  };

  const getVaccineSeriesPlotPoints = (filteredData) => {
    // filtered data is a list of objects
    // sort the list by date
    const sortedData = filteredData.sort((a, b) => {
      const aYear = a.date.split("/")[2] + 2000;

      const aMonthIdx = parseInt(a.date.split("/")[0]) - 1;
      const aMonth = monthOptions[aMonthIdx];
      const aDecimal = yearMonthToDecimal(aYear, aMonth);

      const bYear = b.date.split("/")[2] + 2000;

      const bMonthIdx = parseInt(b.date.split("/")[0]) - 1;
      const bMonth = monthOptions[bMonthIdx];
      const bDecimal = yearMonthToDecimal(bYear, bMonth);
      return aDecimal - bDecimal;
    });
    const data = sortedData.map((dateData) => {
      const { total, daily, date } = dateData;
      return {
        date,
        total,
        daily,
      };
    });
    return data;
  };

  const getVaccineStartMonthOptions = () => {
    if (selectedVaccineStartYear === FIRST_YEAR_VACCINE) {
      return ["December"];
    } else if (selectedVaccineStartYear === selectedVaccineEndYear) {
      //start month cannot be later than the end month for same year
      const selectedVaccineEndMonthIdx = monthToNum[selectedVaccineEndMonth];
      return monthOptions.slice(0, selectedVaccineEndMonthIdx + 1);
    } else {
      return monthOptions;
    }
  };

  const getVaccineEndMonthOptions = () => {
    if (
      selectedVaccineEndYear === selectedVaccineStartYear &&
      selectedVaccineEndYear === today.getFullYear()
    ) {
      //start and end on same year
      //same year is current year irl
      //valid months from selected start month to current month irl
      const selectedVaccineStartMonthIdx =
        monthToNum[selectedVaccineStartMonth];
      console.log(selectedVaccineStartMonthIdx);
      return monthOptions.slice(
        selectedVaccineStartMonthIdx,
        today.getMonth() + 1
      );
    } else if (selectedVaccineEndYear === selectedVaccineStartYear) {
      // end month cannot be earlier than start month for same year
      const selectedVaccineStartMonthIdx =
        monthToNum[selectedVaccineStartMonth];
      return monthOptions.slice(selectedVaccineStartMonthIdx);
    } else if (selectedVaccineEndYear === today.getFullYear()) {
      // end month cannot be later than current month irl
      return monthOptions.slice(0, today.getMonth() + 1);
    } else {
      return monthOptions;
    }
  };

  const getVaccineStartYearOptions = () => {
    const selectedVaccineEndYearIdx =
      selectedVaccineEndYear - FIRST_YEAR_VACCINE;
    return vaccineYearOptions.slice(0, selectedVaccineEndYearIdx + 1);
  };

  const getVaccineEndYearOptions = () => {
    const selectedVaccineStartYearIdx =
      selectedVaccineStartYear - FIRST_YEAR_VACCINE;
    return vaccineYearOptions.slice(selectedVaccineStartYearIdx);
  };

  const handleSelectVaccineStartMonth = (e) => {
    const { value } = e;
    setSelectedVaccineStartDate({
      selectedVaccineStartMonth: value,
      selectedVaccineStartYear,
    });
  };

  const handleSelectVaccineEndMonth = (e) => {
    const { value } = e;
    setSelectedVaccineEndDate({
      selectedVaccineEndMonth: value,
      selectedVaccineEndYear,
    });
  };

  const handleSelectVaccineStartYear = (e) => {
    const { value } = e;
    if (value === FIRST_YEAR_VACCINE) {
      setSelectedVaccineStartDate({
        selectedVaccineStartMonth,
        selectedVaccineStartYear: "December",
      });
    }
    setSelectedVaccineStartDate({
      selectedVaccineStartMonth,
      selectedVaccineStartYear: value,
    });
  };

  const handleSelectVaccineEndYear = (e) => {
    const { value } = e;
    setSelectedVaccineEndDate({
      selectedVaccineEndMonth,
      selectedVaccineEndYear: value,
    });
  };

  const getVaccineTimeSeries = (e) => {
    e.preventDefault();
    setVaccineSeries({
      vaccineSeriesData: null,
      vaccineSeriesDataLoading: true,
    });
  };

  return (
    <div className="time-series">
      {Object.keys(timeSeries).includes(place) && (
        <div
          className={`${place}-covid-case-time-series`}
          height={windowHeight}
          width={windowWidth}
        >
          <div className="covid-date-select-container">
            <div className="covid-graph-type">
              <CustomSwitch
                label={"Cumulative"}
                state={cumulativeCovidSeries}
                setState={setCumulativeCovidSeries}
              />
            </div>
            <div className="covid-start-date-select-container">
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="covid-start-month-select"
                value={{
                  value: selectedCovidStartMonth,
                  label: selectedCovidStartMonth,
                }}
                options={getCovidStartMonthOptions().map((month) => ({
                  value: month,
                  label: month,
                }))}
                onChange={handleSelectCovidStartMonth}
                closeMenuOnSelect={true}
              />
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="covid-start-year-select"
                value={{
                  value: selectedCovidStartYear,
                  label: selectedCovidStartYear,
                }}
                options={getCovidStartYearOptions().map((year) => ({
                  value: year,
                  label: year,
                }))}
                onChange={handleSelectCovidStartYear}
                closeMenuOnSelect={true}
              />
            </div>
            <div className="covid-end-date-select-container">
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="covid-end-month-select"
                value={{
                  value: selectedCovidEndMonth,
                  label: selectedCovidEndMonth,
                }}
                options={getCovidEndMonthOptions().map((month) => ({
                  value: month,
                  label: month,
                }))}
                onChange={handleSelectCovidEndMonth}
                closeMenuOnSelect={true}
              />
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="covid-end-year-select"
                value={{
                  value: selectedCovidEndYear,
                  label: selectedCovidEndYear,
                }}
                options={getCovidEndYearOptions().map((year) => ({
                  value: year,
                  label: year,
                }))}
                onChange={handleSelectCovidEndYear}
                closeMenuOnSelect={true}
              />
            </div>
            <button onClick={getCovidCaseTimeSeries}>
              Get Covid Cases Time Series
            </button>
          </div>
          <div className="covid-chart-container">
            <ResponsiveContainer width="90%" height="100%">
              <LineChart
                data={
                  covidSeriesDataLoading
                    ? []
                    : cumulativeCovidSeries
                    ? covidSeriesData.cumulative
                    : covidSeriesData.daily
                }
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  dot={false}
                  type="monotone"
                  dataKey="cases"
                  stroke={RED}
                />
                <Line
                  dot={false}
                  type="monotone"
                  dataKey="deaths"
                  stroke={BLUE}
                />
                <Line
                  dot={false}
                  type="monotone"
                  dataKey="recovered"
                  stroke={GREEN}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {Object.keys(vaccine).includes(place) && (
        <div
          className={`${place}-vaccine-time-series`}
          height={windowHeight}
          width={windowWidth}
        >
          <div className="vaccine-date-select-container">
            <div className="vaccine-graph-type">
              <CustomSwitch
                label={"Cumulative"}
                state={cumulativeVaccineSeries}
                setState={setCumulativeVaccineSeries}
              />
            </div>
            <div className="vaccine-start-date-select-container">
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="vaccine-start-month-select"
                value={{
                  value: selectedVaccineStartMonth,
                  label: selectedVaccineStartMonth,
                }}
                options={getVaccineStartMonthOptions().map((month) => ({
                  value: month,
                  label: month,
                }))}
                onChange={handleSelectVaccineStartMonth}
                closeMenuOnSelect={true}
              />
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="vaccine-start-year-select"
                value={{
                  value: selectedVaccineStartYear,
                  label: selectedVaccineStartYear,
                }}
                options={getVaccineStartYearOptions().map((year) => ({
                  value: year,
                  label: year,
                }))}
                onChange={handleSelectVaccineStartYear}
                closeMenuOnSelect={true}
              />
            </div>
            <div className="vaccine-end-date-select-container">
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="vaccine-end-month-select"
                value={{
                  value: selectedVaccineEndMonth,
                  label: selectedVaccineEndMonth,
                }}
                options={getVaccineEndMonthOptions().map((month) => ({
                  value: month,
                  label: month,
                }))}
                onChange={handleSelectVaccineEndMonth}
                closeMenuOnSelect={true}
              />
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="end-year-select"
                value={{
                  value: selectedVaccineEndYear,
                  label: selectedVaccineEndYear,
                }}
                options={getVaccineEndYearOptions().map((year) => ({
                  value: year,
                  label: year,
                }))}
                onChange={handleSelectVaccineEndYear}
                closeMenuOnSelect={true}
              />
            </div>
            <button onClick={getVaccineTimeSeries}>
              Get Vaccine Doses Time Series
            </button>
          </div>
          <div className="vaccine-chart-container">
            <ResponsiveContainer width="90%" height="100%">
              <LineChart
                data={
                  vaccineSeriesDataLoading
                    ? []
                    : cumulativeVaccineSeries
                    ? vaccineSeriesData.cumulative
                    : vaccineSeriesData.daily
                }
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  dot={false}
                  type="monotone"
                  dataKey={"doses"}
                  stroke={GREEN}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSeries;
