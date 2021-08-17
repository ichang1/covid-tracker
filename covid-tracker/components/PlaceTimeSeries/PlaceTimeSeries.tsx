import React, { useState } from "react";
import styles from "../../styles/PlaceTimeSeries.module.scss";
import {
  MIN_COVID_DATE,
  MAX_COVID_DATE,
  MIN_VACCINE_DATE,
  MAX_VACCINE_DATE,
  RED,
  GREEN,
  BLUE,
  formatData,
} from "../../utils/timeseries-constants";
import TimeSeries from "../TimeSeries/TimeSeries";
import { flagEmojiToPNG } from "../../utils/misc";
import CustomSwitch from "../CustomSwitch/CustomSwitch";

const covidChartStyle = {
  xAxis: { dataKey: "date" },
  yAxis: {
    Line: [
      { dataKey: "cases", strokeColor: RED },
      { dataKey: "deaths", strokeColor: BLUE },
      { dataKey: "recovered", strokeColor: GREEN },
    ],
  },
};

const vaccineChartStyle = {
  xAxis: { dataKey: "date" },
  yAxis: {
    Line: [{ dataKey: "doses", strokeColor: GREEN }],
  },
};

interface PlaceTimeSeriesProps {
  placeName: string;
  placeSlug: string;
  placeType: string;
  flagEmoji: string;
  formatData: (data: any) => any;
}
export default function PlaceTimeSeries({
  placeName,
  placeSlug,
  placeType,
  flagEmoji,
  formatData,
}: PlaceTimeSeriesProps) {
  const [showCumulativeCovidSeries, setShowCumulativeCovidSeries] =
    useState(true);
  const [showCumulativeVaccineSeries, setShowCumulativeVaccineSeries] =
    useState(true);
  const baseCovidCumulativeEndpoint = `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/covid-19/${placeType}/${placeName}/cumulative`;
  const baseCovidDailyEndpoint = `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/covid-19/${placeType}/${placeName}/daily`;
  const baseVaccineCumulativeEndpoint = `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/vaccine/${placeType}/${placeName}/cumulative`;
  const baseVaccineDailyEndpoint = `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/vaccine/${placeType}/${placeName}/daily`;
  const placeFlag = flagEmojiToPNG(flagEmoji);
  return (
    <>
      <div className={styles["covid-case-time-series"]}>
        <div className={styles["time-series-heading"]}>
          {placeFlag && (
            <div className={styles["time-series-place-flag"]}>{placeFlag}</div>
          )}
          <span className={styles["time-series-label"]}>
            {`${placeName} Coronavirus Time Series`}
          </span>
          <div className={styles["time-series-data-toggle-container"]}>
            <CustomSwitch
              label={showCumulativeCovidSeries ? "Cumulative" : "Daily"}
              state={showCumulativeCovidSeries}
              setState={setShowCumulativeCovidSeries}
            />
          </div>
        </div>
        <div className={`${placeSlug}-covid-case-time-series`}>
          <TimeSeries
            data={[]}
            minDate={MIN_COVID_DATE}
            maxDate={MAX_COVID_DATE}
            chartStyle={covidChartStyle}
            baseEndpoint={
              showCumulativeCovidSeries
                ? baseCovidCumulativeEndpoint
                : baseCovidDailyEndpoint
            }
            formatData={formatData}
          />
        </div>
      </div>
      <div className={styles["vaccine-time-series"]}>
        <div className={styles["time-series-heading"]}>
          {placeFlag && (
            <div className={styles["time-series-place-flag"]}>{placeFlag}</div>
          )}
          <span className={styles["time-series-label"]}>
            {`${placeName} Vaccine Time Series`}
          </span>
          <div className={styles["time-series-data-toggle-container"]}>
            <CustomSwitch
              label={showCumulativeVaccineSeries ? "Cumulative" : "Daily"}
              state={showCumulativeVaccineSeries}
              setState={setShowCumulativeVaccineSeries}
            />
          </div>
        </div>
        <div className={`${placeSlug}-vaccine-time-series`}>
          <TimeSeries
            data={[]}
            minDate={MIN_VACCINE_DATE}
            maxDate={MAX_VACCINE_DATE}
            chartStyle={vaccineChartStyle}
            baseEndpoint={
              showCumulativeVaccineSeries
                ? baseVaccineCumulativeEndpoint
                : baseVaccineDailyEndpoint
            }
            formatData={formatData}
          />
        </div>
      </div>
    </>
  );
}
