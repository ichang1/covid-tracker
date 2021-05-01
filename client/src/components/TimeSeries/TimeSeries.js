import React, { useEffect, useState } from "react";
import "./TimeSeries.css";
import { customStyles } from "./reactSelectStyle";
import useWindowDimensions from "../../customHooks/useWindowDimensions";

import Select from "react-select";
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

import { locations } from "../../data/locations";
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
  const [
    { covidSeriesData, covidSeriesDataLoading },
    setCovidSeries,
  ] = useState({ covidSeriesData: null, covidSeriesDataLoading: true });

  const [
    { vaccineSeriesData, vaccineSeriesDataLoading },
    setVaccineSeries,
  ] = useState({ vaccineSeriesData: null, vaccineSeriesDataLoading: true });

  const [
    { selectedStartMonth, selectedStartYear },
    setSelectedStartDate,
  ] = useState({
    selectedStartMonth: "January",
    selectedStartYear: FIRST_YEAR_COVID,
  });

  const [{ selectedEndMonth, selectedEndYear }, setSelectedEndDate] = useState({
    selectedEndMonth: monthOptions[today.getMonth()],
    selectedEndYear: today.getFullYear(),
  });

  useEffect(() => {
    //start month options might be limited based on year
    //make sure selected start month is still valid
    const selectedStartMonthIdx = monthToNum[selectedStartMonth];
    if (selectedStartMonthIdx >= getStartMonthOptions().length) {
      setSelectedStartDate({
        selectedStartMonth: "January",
        selectedStartYear,
      });
    }
  }, [selectedStartYear]);

  useEffect(() => {
    //end month options might be limited based on year
    //make sure selected end month is still valid
    const selectedEndMonthIdx = monthToNum[selectedEndMonth];
    if (selectedEndMonthIdx >= getEndMonthOptions().length) {
      const validEndMonths = getEndMonthOptions();
      const lastValidEndMonth = validEndMonths[validEndMonths.length - 1];
      setSelectedEndDate({
        selectedEndMonth: lastValidEndMonth,
        selectedEndYear,
      });
    }
  }, [selectedEndYear]);

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
      selectedStartYear,
      selectedStartMonth
    );
    const dateUpperBound = yearMonthToDecimal(
      selectedEndYear,
      selectedEndMonth
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
    const filteredData = filterCovidSeriesData(parsedData);
    setCovidSeries({
      covidSeriesData: filteredData,
      covidSeriesDataLoading: false,
    });
  };

  const getCovidSeriesPlotPoints = () => {
    const { cases, deaths, recovered } = covidSeriesData;
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

  const getStartMonthOptions = () => {
    if (selectedStartYear === selectedEndYear) {
      //start month cannot be later than the end month for same year
      const selectedEndMonthIdx = monthToNum[selectedEndMonth];
      return monthOptions.slice(0, selectedEndMonthIdx + 1);
    } else {
      return monthOptions;
    }
  };

  const getEndMonthOptions = () => {
    if (selectedEndYear === today.getFullYear()) {
      const currentMonthIdx = today.getMonth();
      return monthOptions.slice(0, currentMonthIdx + 1);
    } else if (selectedEndYear === selectedStartYear) {
      // lower bound for end month
      const selectedStartMonthIdx = monthToNum[selectedStartMonth];
      return monthOptions.slice(selectedStartMonthIdx);
    } else {
      return monthOptions;
    }
  };

  const getStartYearOptions = () => {
    const selectedEndYearIdx = selectedEndYear - FIRST_YEAR_COVID;
    return yearOptions.slice(0, selectedEndYearIdx + 1);
  };

  const getEndYearOptions = () => {
    const selectedStartYearIdx = selectedStartYear - FIRST_YEAR_COVID;
    return yearOptions.slice(selectedStartYearIdx);
  };

  const handleSelectStartMonth = (e) => {
    const { value } = e;
    setSelectedStartDate({ selectedStartMonth: value, selectedStartYear });
  };

  const handleSelectEndMonth = (e) => {
    const { value } = e;
    setSelectedEndDate({ selectedEndMonth: value, selectedEndYear });
  };

  const handleSelectStartYear = (e) => {
    const { value } = e;
    setSelectedStartDate({ selectedStartMonth, selectedStartYear: value });
  };

  const handleSelectEndYear = (e) => {
    const { value } = e;
    setSelectedEndDate({ selectedEndMonth, selectedEndYear: value });
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
          <div class="date-select-container">
            <div class="start-date-select-container">
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="start-month-select"
                value={{
                  value: selectedStartMonth,
                  label: selectedStartMonth,
                }}
                options={getStartMonthOptions().map((month) => ({
                  value: month,
                  label: month,
                }))}
                onChange={handleSelectStartMonth}
                closeMenuOnSelect={true}
              />
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="start-year-select"
                value={{
                  value: selectedStartYear,
                  label: selectedStartYear,
                }}
                options={getStartYearOptions().map((year) => ({
                  value: year,
                  label: year,
                }))}
                onChange={handleSelectStartYear}
                closeMenuOnSelect={true}
              />
            </div>
            <div class="end-date-select-container">
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="end-month-select"
                value={{ value: selectedEndMonth, label: selectedEndMonth }}
                options={getEndMonthOptions().map((month) => ({
                  value: month,
                  label: month,
                }))}
                onChange={handleSelectEndMonth}
                closeMenuOnSelect={true}
              />
              <Select
                styles={customStyles}
                width="200px"
                isMulti={false}
                name="end-year-select"
                value={{ value: selectedEndYear, label: selectedEndYear }}
                options={getEndYearOptions().map((year) => ({
                  value: year,
                  label: year,
                }))}
                onChange={handleSelectEndYear}
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
                data={covidSeriesDataLoading ? [] : getCovidSeriesPlotPoints()}
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
    </div>
  );
};

export default TimeSeries;
