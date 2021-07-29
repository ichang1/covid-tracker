import React, { FC, useState } from "react";
import { useRouter } from "next/router";
import { places } from "../../utils/places";
import useWindowDimensions from "../../customHooks/useWindowDimensions";
import CustomSwitch from "../../components/CustomSwitch/CustomSwitch";
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
import TimeSeries from "../../components/TimeSeries/TimeSeries";

const slugsToPlaces: { [key: string]: string } = Object.entries(places).reduce(
  (obj, [place, { slugs }]) => {
    const placeSlugsToPlace = slugs.reduce(
      (_obj, slug) => ({ ..._obj, [`${slug}`]: place }),
      obj
    );
    return placeSlugsToPlace;
  },
  {}
);

interface PlaceProps {
  place: string;
}

const covidChartStyle = {
  XAxis: { dataKey: "date" },
  YAxis: {
    Line: [
      { dataKey: "cases", strokeColor: RED },
      { dataKey: "deaths", strokeColor: BLUE },
      { dataKey: "recovered", strokeColor: GREEN },
    ],
  },
};

const vaccineChartStyle = {
  XAxis: { dataKey: "date" },
  YAxis: {
    Line: [{ dataKey: "doses", strokeColor: GREEN }],
  },
};

export default function Place({ place }: PlaceProps) {
  const [showCumulativeCovidSeries, setShowCumulativeCovidSeries] =
    useState(true);
  const [showCumulativeVaccineSeries, setShowCumulativeVaccineSeries] =
    useState(true);

  const placeName = slugsToPlaces[place];
  const { place_type: placeType } = places[placeName];

  const baseCovidCumulativeEndpoint = `http://localhost:4000/covid-19/${placeType}/${placeName}/cumulative`;
  const baseCovidDailyEndpoint = `http://localhost:4000/covid-19/${placeType}/${placeName}/daily`;
  const baseVaccineCumulativeEndpoint = `http://localhost:4000/vaccine/${placeType}/${placeName}/cumulative`;
  const baseVaccineDailyEndpoint = `http://localhost:4000/vaccine/${placeType}/${placeName}/daily`;

  return (
    <div>
      <div className="time-series">
        <div className={`${place}-covid-case-time-series`}>
          <TimeSeries
            label={`${placeName} Covid Time Series`}
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
          <CustomSwitch
            label={showCumulativeCovidSeries ? "Cumulative" : "Daily"}
            state={showCumulativeCovidSeries}
            setState={setShowCumulativeCovidSeries}
          />
        </div>
        <div className={`${place}-vaccine-time-series`}>
          <TimeSeries
            label={`${placeName} Vaccine Dosage Time Series`}
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
          <CustomSwitch
            label={showCumulativeVaccineSeries ? "Cumulative" : "Daily"}
            state={showCumulativeVaccineSeries}
            setState={setShowCumulativeVaccineSeries}
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
