import { react, useEffect, useState } from "react";
import "./TimeSeries.css";
import { locations } from "../../data/locations";
import { timeSeries } from "../../data/timeSeries";
import { vaccine } from "../../data/vaccine";

const TimeSeries = (place) => {
  const [showCovidSeries, setShowCovidSeries] = useState(false);
  const [showVaccineSeries, setShowVaccineSeries] = useState(false);

  const getCovidSeriesPoints = async () => {
    return;
  };

  const getCovidSeriesPlot = (points) => {
    return;
  };

  const getVaccineSeriesPoints = async () => {
    return;
  };

  const getVaccineSeriesPlot = (points) => {
    return;
  };

  return <div className={`${place}-time-series`}>{place}</div>;
};

export default TimeSeries;
