import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Map from "../components/Map/Map";
import { places } from "../utils/places";
import { SourceProps, LayerProps } from "react-map-gl";
import { MIN_COVID_DATE, MAX_COVID_DATE } from "../utils/timeseries-constants";
import { useState } from "react";
import CustomSelect from "../components/CustomSelect/CustomSelect";
import { useEffect } from "react";

const covidPlacesSource: SourceProps = {
  id: "covidPlaces",
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: Object.keys(places).map((place) => {
      const { latitude, longitude } = places[place];
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        properties: {
          name: place,
        },
      };
    }),
  },
};

const covidPlacesLayer: LayerProps = {
  id: "covidPlaces",
  type: "symbol",
  source: "covidPlaces",
  layout: {
    "icon-image": "map-pin",
    "icon-allow-overlap": true,
    "icon-size": {
      stops: [...Array(20).keys()].map((i) => [0.5 * i, 0.1 * Math.sqrt(i)]),
    },
  },
  paint: {},
};

const mapStyle = {
  points: {
    covidPlaces: {
      source: covidPlacesSource,
      layer: covidPlacesLayer,
    },
  },
};

function getPlaceBaseEndpoints(place: string): string[] {
  if (!place) {
    return [];
  }
  const { place_type: placeType } = places[place];
  const baseCovidDateEndpoint = `http://localhost:4000/covid-19/${placeType}/${place}/date`;
  const baseVaccineDateEndpoint = `http://localhost:4000/vaccine/${placeType}/${place}/date`;
  return [baseCovidDateEndpoint, baseVaccineDateEndpoint];
}

function popupDataToJSX(data: { [key: string]: any }): JSX.Element {
  /*
   data: {
      '.../covid-19/state/california/date/?date=12-24-2020': {...}
      '.../vaccine/state/california/date/?date=12-24-2020': {...}
   }
   */
  const rawData = Object.values(data).reduce(
    (_rawData, getResData) => ({ ..._rawData, ...getResData }),
    {}
  );

  const {
    totalCases = 0,
    todayCases = 0,
    totalDeaths = 0,
    todayDeaths = 0,
    totalRecovered = 0,
    todayRecovered = 0,
    totalDoses = 0,
    todayDoses = 0,
    state = "",
    country = "",
    province = "",
  } = rawData;

  const place = [state, country, province].join("");

  const stats = [
    { label: "Total Cases", stat: totalCases },
    { label: "Cases Today", stat: todayCases },
    { label: "Total Deaths", stat: totalDeaths },
    { label: "Deaths Today", stat: todayDeaths },
    { label: "Total Recovered", stat: totalRecovered },
    { label: "Recovered Today", stat: todayRecovered },
    { label: "Total Doses", stat: totalDoses },
    { label: "Doses Today", stat: todayDoses },
  ];

  return (
    <>
      {stats.map(({ label, stat }, idx) => {
        // Total Cases -> total-cases-california
        const placeSlugish = place
          .split(" ")
          .map((word) => word.toLowerCase())
          .join("-");
        const id = `${label
          .split(" ")
          .map((word) => word.toLowerCase())
          .join("-")}-${placeSlugish}`;
        return (
          <>
            <div className="popup-data-container" key={id}>
              <label
                key={`${id}-label-${idx}`}
                className={`${id}-popup-label`}
                htmlFor={id}
              >{`${label}: `}</label>
              <span key={`${id}-${idx}`} className={`${id}-popup-stat`} id={id}>
                {stat.toLocaleString()}
              </span>
            </div>
          </>
        );
      })}
    </>
  );
}

const placeOptions = Object.keys(places).map((p) => ({ value: p, label: p }));

export default function Home() {
  const [searchPlace, setSearchPlace] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      <Head>
        <title>Global Covid-19 Tracker</title>
        <meta
          name="description"
          content="Interactive Global Covid-19 Tracker"
        />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <div className="page-select-search">
        <CustomSelect
          options={placeOptions}
          isMulti={false}
          setValue={setSearchPlace}
          placeholder={"Select a place..."}
        />
      </div>

      <main className={styles.main}>
        <Map
          searchPlace={searchPlace}
          places={places}
          mapStyle={mapStyle}
          popupDataToJSX={popupDataToJSX}
          getPlaceBaseEndpoints={getPlaceBaseEndpoints}
          minDate={MIN_COVID_DATE}
          maxDate={MAX_COVID_DATE}
        />
      </main>

      {/* <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer> */}
    </div>
  );
}
