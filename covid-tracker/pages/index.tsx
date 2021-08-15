import Head from "next/head";
import styles from "../styles/Home.module.css";
import Map from "../components/Map/Map";
import { places } from "../utils/places";
import { SourceProps, LayerProps } from "react-map-gl";
import { MIN_COVID_DATE, MAX_COVID_DATE } from "../utils/timeseries-constants";
import { useState } from "react";
import CustomSelect from "../components/CustomSelect/CustomSelect";
import { baseUrl } from "../utils/misc";

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
  const baseCovidDateEndpoint = `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/covid-19/${placeType}/${place}/date`;
  const baseVaccineDateEndpoint = `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/vaccine/${placeType}/${place}/date`;
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
        <title>{"Global Covid-19 Tracker \u2012 Interactive Map"}</title>
        <meta
          name="title"
          content={"Global Covid-19 Tracker \u2012 Interactive Map"}
        />
        <meta
          name="description"
          content="Interactive Global Map for tracking Covid-19 statistics for any day since the start of the Covid-19 pandemic"
        />

        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000"}
        />
        <meta
          property="og:title"
          content={"Global Covid-19 Tracker \u2012 Interactive Map"}
        />
        <meta
          property="og:description"
          content="Interactive Global Map for tracking Covid-19 statistics for any day since the start of the Covid-19 pandemic"
        />
        <meta property="og:image" content="/logo.png" />

        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content={baseUrl} />
        <meta
          property="twitter:title"
          content={"Global Covid-19 Tracker \u2012 Interactive Map"}
        />
        <meta
          property="twitter:description"
          content="Interactive Global Map for tracking Covid-19 statistics for any day since the start of the Covid-19 pandemic"
        />
        <meta property="twitter:image" content="/logo.png" />
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

      <main className={styles["map-container"]}>
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
    </div>
  );
}
