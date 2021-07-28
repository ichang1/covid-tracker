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

export default function Place({ place }: PlaceProps) {
  const [showCumulativeCovidSeries, setShowCumulativeCovidSeries] =
    useState(true);

  const placeName = slugsToPlaces[place];
  const { place_type: placeType } = places[placeName];

  const baseCovidCumulativeEndpoint = `http://localhost:4000/covid-19/${placeType}/${placeName}/cumulative`;
  const baseCovidDailyEndpoint = `http://localhost:4000/covid-19/${placeType}/${placeName}/daily`;
  const baseVaccineEndpoint = `http://localhost:4000/vaccine/${placeType}/${placeName}`;

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
