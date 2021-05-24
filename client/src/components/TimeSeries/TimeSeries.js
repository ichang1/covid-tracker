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
const yearOptions = Array.from(
  new Array(today.getFullYear() - FIRST_YEAR_COVID + 1),
  (val, idx) => FIRST_YEAR_COVID + idx
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
  // const [showCovidSeries, setShowCovidSeries] = useState(false);
  // const [showVaccineSeries, setShowVaccineSeries] = useState(false);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

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

  const [{ vaccineSeriesData, vaccineSeriesDataLoading }, setVaccineSeries] =
    useState({ vaccineSeriesData: null, vaccineSeriesDataLoading: true });

  useEffect(() => {
    console.log(cumulativeCovidSeries);
  }, [cumulativeCovidSeries]);

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

    console.log(cumulativeCovidSeriesPlotPoints);
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

  const getVaccineSeriesData = async () => {
    const { api: url } = vaccine[place];
    let parsedData;
    try {
      const res = await axios.get(url);
      const data = res.data;
      parsedData = data;
    } catch (err) {
      parsedData = {};
    }
    setVaccineSeries({
      vaccineSeriesData: parsedData,
      vaccineSeriesDataLoading: false,
    });
  };

  const getVaccineSeriesPlot = (points) => {
    return;
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
    if (selectedCovidEndYear === today.getFullYear()) {
      const currentMonthIdx = today.getMonth();
      return monthOptions.slice(0, currentMonthIdx + 1);
    } else if (selectedCovidEndYear === selectedCovidStartYear) {
      // lower bound for end month
      const selectedCovidStartMonthIdx = monthToNum[selectedCovidStartMonth];
      return monthOptions.slice(selectedCovidStartMonthIdx);
    } else {
      return monthOptions;
    }
  };

  const getCovidStartYearOptions = () => {
    const selectedCovidEndYearIdx = selectedCovidEndYear - FIRST_YEAR_COVID;
    return yearOptions.slice(0, selectedCovidEndYearIdx + 1);
  };

  const getCovidEndYearOptions = () => {
    const selectedCovidStartYearIdx = selectedCovidStartYear - FIRST_YEAR_COVID;
    return yearOptions.slice(selectedCovidStartYearIdx);
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

  return (
    <div className="time-series">
      {Object.keys(timeSeries).includes(place) && (
        <div
          className={`${place}-covid-case-time-series`}
          height={windowHeight}
          width={windowWidth}
        >
          <div className="date-select-container">
            <div className="covid-graph-type">
              <CustomSwitch
                label={"switch"}
                state={cumulativeCovidSeries}
                setState={setCumulativeCovidSeries}
              />
            </div>
            <div className="start-date-select-container">
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="start-month-select"
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
                name="start-year-select"
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
            <div className="end-date-select-container">
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="end-month-select"
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
                name="end-year-select"
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
          <div className="chart-container">
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
          Vaccine
        </div>
      )}
    </div>
  );
};

export default TimeSeries;
