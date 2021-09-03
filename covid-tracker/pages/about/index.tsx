import Head from "next/head";
import React from "react";
import { baseUrl } from "../../utils/misc";
import styles from "../../styles/About.module.scss";
import Link from "next/link";

export default function About() {
  return (
    <div className={styles["about-container"]}>
      <Head>
        <title>{"Global Coronavirus Tracker \u2012 About"}</title>
        <meta
          name="title"
          content={"Global Coronavirus Tracker \u2012 About"}
        />
        <meta
          name="description"
          content="Interactive Global Map for tracking Coronavirus statistics for any day since the start of the Covid-19 pandemic"
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={baseUrl} />
        <meta
          property="og:title"
          content={"Global Coronavirus Tracker \u2012 About"}
        />
        <meta
          property="og:description"
          content="Interactive Global Map for tracking Coronavirus statistics for any day since the start of the Covid-19 pandemic"
        />
        <meta property="og:image" content={`${baseUrl}/logo.png`} />

        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content={baseUrl} />
        <meta
          property="twitter:title"
          content={"Global Coronavirus Tracker \u2012 About"}
        />
        <meta
          property="twitter:description"
          content="Interactive Global Map for tracking Coronavirus statistics for any day since the start of the Covid-19 pandemic"
        />
        <meta property="twitter:image" content={`${baseUrl}/logo.png`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>About the Global Coronavirus Tracker</h1>
      <div className={styles["paragraph-container"]}>
        <p>
          The site&apos;s main page consists of an interactive map similar to
          google maps with clickable predetermined locations. When these
          locations are clicked on, there will be a coronavirus related
          statistics popup. Within each popup, there is a date input allowing
          you to view the statistics for another day. Each place also has an
          additional timeseries popup/page which is accessible from its
          corresponding popup from the map. These consist of timeseries plots
          detailing the cumulative/daily change in the number of
          cases/deaths/recovered/vaccine dosages for that place.
        </p>
      </div>
      <h1>About the Interactive Map</h1>
      <div className={styles["paragraph-container"]}>
        <p>
          The Interactive Map has predetermined markers for certain countries,
          provinces and states. Not all places are available due to
          accessibility of data. There is a search bar for all available places
          that automatically moves the map viewport to the searched place.
        </p>
      </div>
      <h1>About the Data</h1>
      <div className={styles["paragraph-container"]}>
        <p>
          The data comes from the
          <a
            target="_blank"
            href="https://disease.sh/"
            rel="noopener noreferrer"
            className={styles["icon-site"]}
          >
            disease.sh API
          </a>
          which gets the data from Johns Hopkins and is updated every 24 hours.
          Some of the numbers are rough estimates because daily data from every
          place is not readily available.
        </p>
      </div>
      <h1>Disclaimers</h1>
      <div className={styles["paragraph-container"]}>
        <p>
          Note that the data source the data comes from doesn&apos;t always
          provide valid data. These statistics will be labeled as 0 or some
          other invalid number. Also, vaccine dosages refer to a single shot not
          the number of vaccinated people. Lastly, all icons are from the
          corona-virus-precautions-3 icon set on
          <a
            target="_blank"
            href="https://freeicons.io/"
            rel="noopener noreferrer"
            className={styles["icon-site"]}
          >
            https://freeicons.io/
          </a>
        </p>
      </div>
    </div>
  );
}
