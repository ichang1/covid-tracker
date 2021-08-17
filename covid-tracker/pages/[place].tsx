import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { places, slugsToPlaces } from "../utils/places";
import { formatData } from "../utils/timeseries-constants";
import CustomSelect from "../components/CustomSelect/CustomSelect";
import styles from "../styles/Place.module.scss";
import Head from "next/head";
import { baseUrl } from "../utils/misc";
import PlaceTimeSeries from "../components/PlaceTimeSeries/PlaceTimeSeries";

interface PlaceProps {
  place: string;
  url: string;
}

const placeOptions = Object.keys(places).map((p) => ({ value: p, label: p }));

export default function Place({ place, url }: PlaceProps) {
  const router = useRouter();
  const [searchPlace, setSearchPlace] = useState<string | null>(null);

  const placeName = slugsToPlaces[place];
  const { place_type: placeType, flag } = places[placeName];

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
      <PlaceTimeSeries
        placeName={placeName}
        placeSlug={place}
        placeType={placeType}
        flagEmoji={flag}
        formatData={formatData}
      />
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
