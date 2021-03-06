import React, { useState, useEffect, MouseEventHandler } from "react";
import TimeSeriesGraph from "./TimeSeriesGraph/TimeSeriesGraph";
import { Data, LineStyle } from "./utils/types";
import styles from "../../styles/TimeSeries.module.scss";
import { YYYYMMDD_MMDDYYYY } from "../../utils/timeseries-constants";
import useAxios from "../../customHooks/useAxios";

interface TimeSeriesProps {
  data?: Data[];
  minDate: string;
  maxDate: string;
  baseEndpoint: string;
  chartStyle: {
    xAxis: {
      dataKey: string;
    };
    yAxis: {
      Line: LineStyle[];
    };
    legend?: {
      [key: string]: any;
    };
  };
  formatData: (data: any) => any;
}

function getFullEndpoint(
  baseEndpoint: string,
  startDate: string,
  endDate: string
) {
  //YYYY-MM-DD -> MM-DD-YYYY
  const startDateFormatted = YYYYMMDD_MMDDYYYY(startDate);
  const endDateFormatted = YYYYMMDD_MMDDYYYY(endDate);
  const fullEndpoint = `${baseEndpoint}?start=${startDateFormatted}&end=${endDateFormatted}`;
  return fullEndpoint;
}

export default function TimeSeries({
  minDate,
  maxDate,
  baseEndpoint,
  chartStyle,
  formatData,
}: TimeSeriesProps) {
  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(maxDate);
  const [endpoint, setEndpoint] = useState<string>(
    getFullEndpoint(baseEndpoint, startDate, endDate)
  );

  const { data, isLoading, isSuccess } = useAxios(endpoint, endpoint, true);

  function handleGetData(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const fullEndpoint = getFullEndpoint(baseEndpoint, startDate, endDate);
    setEndpoint(fullEndpoint);
  }

  useEffect(() => {
    const fullEndpoint = getFullEndpoint(baseEndpoint, startDate, endDate);
    setEndpoint(fullEndpoint);
  }, [baseEndpoint]);

  return (
    <div className="time-series-container">
      <div className={styles["time-series-graph-container"]}>
        <TimeSeriesGraph
          data={!isLoading && isSuccess && data ? formatData(data) : []}
          chartStyle={chartStyle}
        />
      </div>
      <div className={styles["time-series-buttons-container"]}>
        <div className={styles["start-date-selector-container"]}>
          <label
            className={styles["date-selector-label"]}
            htmlFor="start-date-selector"
          >
            Start Date:
          </label>
          <input
            className={styles["date-selector"]}
            name="start-date-selector"
            type="date"
            onChange={(e) => {
              e.preventDefault();
              setStartDate(e.target.value);
            }}
            value={startDate}
            min={minDate}
            max={endDate}
            id="start-date-selector"
          />
        </div>
        <div className={styles["end-date-selector-container"]}>
          <label
            className={styles["date-selector-label"]}
            htmlFor={"end-date-selector"}
          >
            End Date:
          </label>
          <input
            className={styles["date-selector"]}
            name="end-date-selector"
            type="date"
            onChange={(e) => {
              e.preventDefault();
              setEndDate(e.target.value);
            }}
            value={endDate}
            min={startDate}
            max={maxDate}
            id="end-date-selector"
          />
        </div>
        <button
          className={styles["time-series-get-data-button"]}
          onClick={handleGetData}
        >
          Get Data
        </button>
      </div>
    </div>
  );
}
