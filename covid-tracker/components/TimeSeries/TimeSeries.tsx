import React, { useState, useEffect } from "react";
import TimeSeriesGraph from "./TimeSeriesGraph/TimeSeriesGraph";
import { Data, LineStyle } from "./utils/types";
import styles from "./TimeSeries.module.css";
import { YYYYMMDD_MMDDYYYY } from "../../utils/timeseries-constants";
import useAxios from "../../customHooks/useAxios";

interface TimeSeriesProps {
  label: string;
  data?: Data[];
  minDate: string;
  maxDate: string;
  baseEndpoint: string;
  chartStyle: {
    XAxis: {
      dataKey: string;
    };
    YAxis: {
      Line: LineStyle[];
    };
  };
  formatData: (data: any) => any;
}

export default function TimeSeries({
  label,
  minDate,
  maxDate,
  baseEndpoint,
  chartStyle,
  formatData,
}: TimeSeriesProps) {
  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(maxDate);
  const [endpoint, setEndpoint] = useState<string | null>(null);

  const { data, isLoading } = useAxios(endpoint);
  // console.log(formatData(data), isLoading);
  useEffect(() => {
    //YYYY-MM-DD -> MM-DD-YYYY
    const startDateFormatted = YYYYMMDD_MMDDYYYY(startDate);
    const endDateFormatted = YYYYMMDD_MMDDYYYY(endDate);
    const fullEndpoint = `${baseEndpoint}?start=${startDateFormatted}&end=${endDateFormatted}`;
    setEndpoint(fullEndpoint);
  }, [startDate, endDate, baseEndpoint]);

  return (
    <div className="time-series-container">
      <span className={styles["time-series-label"]}>{label}</span>
      <div className={styles["time-series-graph-container"]}>
        <TimeSeriesGraph
          data={!isLoading && data ? formatData(data) : []}
          chartStyle={chartStyle}
        />
      </div>
      <div className={styles["time-series-buttons-container"]}>
        <div className={styles["start-date-selector-container"]}>
          <span className={styles["date-selector-label"]} id="start-date">
            Start Date:
          </span>
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
          />
        </div>
        <div className={styles["end-date-selector-container"]}>
          <span className={styles["date-selector-label"]} id="start-date">
            End Date:
          </span>
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
          />
        </div>
        <button>Get {label} Data</button>
      </div>
    </div>
  );
}
