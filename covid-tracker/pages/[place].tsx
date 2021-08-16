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
import Head from "next/head";
import { flagEmojiToPNG, baseUrl } from "../utils/misc";

interface PlaceProps {
  place: string;
  url: string;
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

export default function Place({ place, url }: PlaceProps) {
  const router = useRouter();
  const [showCumulativeCovidSeries, setShowCumulativeCovidSeries] =
    useState(true);
  const [showCumulativeVaccineSeries, setShowCumulativeVaccineSeries] =
    useState(true);
  const [searchPlace, setSearchPlace] = useState<string | null>(null);

  const placeName = slugsToPlaces[place];
  const { place_type: placeType } = places[placeName];

  const baseCovidCumulativeEndpoint = `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/covid-19/${placeType}/${placeName}/cumulative`;
  const baseCovidDailyEndpoint = `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/covid-19/${placeType}/${placeName}/daily`;
  const baseVaccineCumulativeEndpoint = `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/vaccine/${placeType}/${placeName}/cumulative`;
  const baseVaccineDailyEndpoint = `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/vaccine/${placeType}/${placeName}/daily`;

  useEffect(() => {
    if (searchPlace && searchPlace !== placeName) {
      const searchPlaceSlug = places[searchPlace].slugs[0];
      router.push(`/${searchPlaceSlug}`);
    }
  }, [searchPlace]);

  return (
    <div className={styles["place-time-series-container"]}>
      <Head>
        <title>{`Global Coronavirus Tracker \u2012 
          ${placeName}
          Time Series`}</title>
        <meta
          name="title"
          content={`Global Coronavirus Tracker \u2012
            ${placeName} Time Series`}
        />
        <meta
          name="description"
          content="Interactive Global Time Series Plots for tracking Coronavirus statistics for any day since the start of the Covid-19 pandemic"
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta
          property="og:title"
          content={`Global Coronavirus Tracker \u2012
            ${placeName}
            Time Series`}
        />
        <meta
          property="og:description"
          content="Interactive Global Time Series Plots for tracking Coronavirus statistics for any day since the start of the Covid-19 pandemic"
        />
        <meta property="og:image" content={`${baseUrl}/logo.png`} />

        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content={url} />
        <meta
          property="twitter:title"
          content={`Global Coronavirus Tracker \u2012
            ${placeName} Time Series`}
        />
        <meta
          property="twitter:description"
          content="Interactive Global Time Series Plots for tracking Coronavirus statistics for any day since the start of the Covid-19 pandemic"
        />
        <meta property="twitter:image" content={`${baseUrl}/logo.png`} />
      </Head>
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
          <div className={styles["time-series-place-flag"]}>
            {flagEmojiToPNG(places[placeName].flag)}
          </div>
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
          <div className={styles["time-series-place-flag"]}>
            {flagEmojiToPNG(places[placeName].flag)}
          </div>
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
    props: { place, url: `${baseUrl}/${place}` },
  };
}

export async function getStaticPaths() {
  const paths = Object.keys(slugsToPlaces).map((slug) => ({
    params: { place: slug.toLowerCase() },
  }));
  return { paths, fallback: false };
}
