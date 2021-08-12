import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { places, slugsToPlaces } from "../utils/places";
import CustomSwitch from "../components/CustomSwitch/CustomSwitch";
import {
  MIN_COVID_DATE,
  MAX_COVID_DATE,
  MIN_VACCINE_DATE,
  MAX_VACCINE_DATE,
  RED,
  GREEN,
  BLUE,
  formatData,
} from "../utils/timeseries-constants";
import TimeSeries from "../components/TimeSeries/TimeSeries";
import CustomSelect from "../components/CustomSelect/CustomSelect";
import styles from "../styles/Place.module.scss";

interface PlaceProps {
  place: string;
}

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

const placeOptions = Object.keys(places).map((p) => ({ value: p, label: p }));

export default function Place({ place }: PlaceProps) {
  const router = useRouter();
  const [showCumulativeCovidSeries, setShowCumulativeCovidSeries] =
    useState(true);
  const [showCumulativeVaccineSeries, setShowCumulativeVaccineSeries] =
    useState(true);
  const [searchPlace, setSearchPlace] = useState<string | null>(null);

  const placeName = slugsToPlaces[place];
  const { place_type: placeType } = places[placeName];

  const baseCovidCumulativeEndpoint = `http://localhost:4000/covid-19/${placeType}/${placeName}/cumulative`;
  const baseCovidDailyEndpoint = `http://localhost:4000/covid-19/${placeType}/${placeName}/daily`;
  const baseVaccineCumulativeEndpoint = `http://localhost:4000/vaccine/${placeType}/${placeName}/cumulative`;
  const baseVaccineDailyEndpoint = `http://localhost:4000/vaccine/${placeType}/${placeName}/daily`;

  useEffect(() => {
    if (searchPlace && searchPlace !== placeName) {
      const searchPlaceSlug = places[searchPlace].slugs[0];
      router.push(`/${searchPlaceSlug}`);
    }
  }, [searchPlace]);

  return (
    <div className={styles["place-time-series-container"]}>
      <div className="page-select-search">
        <CustomSelect
          options={placeOptions}
          isMulti={false}
          setValue={setSearchPlace}
          placeholder={"Select a place..."}
        />
      </div>
      <div className={styles["covid-case-time-series"]}>
        <div className={styles["time-series-heading"]}>
          <span
            className={styles["time-series-label"]}
          >{`${placeName} Covid Time Series`}</span>
          <div className={styles["time-series-data-toggle-container"]}>
            <CustomSwitch
              label={showCumulativeCovidSeries ? "Cumulative" : "Daily"}
              state={showCumulativeCovidSeries}
              setState={setShowCumulativeCovidSeries}
            />
          </div>
        </div>
        <div className={`${place}-covid-case-time-series`}>
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
          <span
            className={styles["time-series-label"]}
          >{`${placeName} Vaccine Dosage Time Series`}</span>
          <div className={styles["time-series-data-toggle-container"]}>
            <CustomSwitch
              label={showCumulativeVaccineSeries ? "Cumulative" : "Daily"}
              state={showCumulativeVaccineSeries}
              setState={setShowCumulativeVaccineSeries}
            />
          </div>
        </div>
        <div className={`${place}-vaccine-time-series`}>
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
    </div>
  );
}

interface Request {
  params: {
    place: string;
  };
}
export async function getStaticProps({ params }: Request) {
  const { place } = params;
  return {
    props: { place },
  };
}

export async function getStaticPaths() {
  const paths = Object.keys(slugsToPlaces).map((slug) => ({
    params: { place: slug.toLowerCase() },
  }));
  return { paths, fallback: false };
}
