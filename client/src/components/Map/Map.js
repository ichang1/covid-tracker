import React, { useState, useEffect, useCallback, useRef } from "react";
import "./Map.css";

import ReactMapGl, { Popup, Source, Layer } from "react-map-gl";
import { Link } from "react-router-dom";

import { locations } from "../../data/locations";
import { timeSeries } from "../../data/timeSeries";
import { source, layerStyle } from "./covidData";

import axios from "axios";

/**
 * function parses covid data from Worldometers api
 * @param {{cases/todayCases/deaths/todayDeaths/recovered/active: Number, ...}} data
 * @returns Object with total number of cases, current number of deaths/recovered/infected and today cases/deaths
 */
function parseWorldometers(data) {
  if (Object.keys(data).includes("message")) {
    const { message } = data;
    return { message: message };
  }
  const { cases, todayCases, deaths, todayDeaths, recovered, active } = data;
  const parsedData = {
    Cases: cases.toLocaleString(),
    "Today Cases": todayCases.toLocaleString(),
    Deaths: deaths.toLocaleString(),
    "Today Deaths": todayDeaths.toLocaleString(),
    Recovered: recovered.toLocaleString(),
    Infected: active.toLocaleString(),
  };
  return parsedData;
}

/**
 * function parses covid data from John Hopkins api
 * @param {Object[]} data list of objects with covid data for all countries and their provinces
 * @param {String} place  name of the province
 * @returns
 */
function parseJHUCSSE(data, place) {
  const filteredPlaces = data.filter(
    (placeData) => placeData.province === place
  );
  if (filteredPlaces.length < 1) {
    return { message: `Covid data for ${place} not found.` };
  }

  const specificPlaceData = filteredPlaces[0];
  const { confirmed, deaths, recovered } = specificPlaceData.stats;
  const parsedData = {
    Confirmed: confirmed.toLocaleString(),
    Deaths: deaths.toLocaleString(),
    Recovered: recovered.toLocaleString(),
  };
  return parsedData;
}

/**
 *
 * @param {Object} data
 * @param {String} place
 * @returns Object with covid statistics
 */
function parseData(data, place) {
  const { api } = locations[place];
  const parsedData =
    api === "Worldometers"
      ? parseWorldometers(data)
      : parseJHUCSSE(data, place);
  return parsedData;
}

const mapbox_style =
  "mapbox://styles/isaacc/ckmcxu2s609qb17rwla4bcixc?optimize=true";

//============================================================================================================

const Map = () => {
  const INITIAL_VIEWPORT = {
    latitude: 0,
    longitude: 0,
    width: "80vw",
    height: "80vh",
    zoom: 0.5,
  };
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [{ popupData, popupDataLoading }, setPopupData] = useState({
    popupData: null,
    popupDataLoading: true,
  });
  const [hoverPlaceName, setHoverPlaceName] = useState("");
  const [showPlaceName, setShowPlaceName] = useState(false);

  const mapRef = useRef(null);

  useEffect(() => {
    if (selectedPlace) {
      getPopupBodyData(selectedPlace);
    }
  }, [selectedPlace]);

  /**
   * Add event listener on mount for popup
   */
  useEffect(() => {
    const listener = (e) => {
      if (e.key === "Escape") {
        setSelectedPlace(null);
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  /**
   * handles clicking on map marker
   * @param {event} e
   */
  const handleClick = (e) => {
    // get the features that are related to our defined covid data
    const covidFeatures = e.features.filter(
      (feat) => feat.source === "covidData"
    );

    // get the first covid data feature and make a popup
    if (covidFeatures.length > 0) {
      const place = covidFeatures[0]?.properties?.name;
      setSelectedPlace(place);
      setPopupData({ popupData: null, popupDataLoading: true });
    }
  };

  /**
   * handles hovering over a map marker
   * @param {event} e
   */
  const handleHover = (e) => {
    // get the features that are related to our defne covid data
    const covidFeatures = e.features.filter(
      (feat) => feat.source === "covidData"
    );

    // get the first covid data feature
    if (covidFeatures.length > 0 && !e.target.className.includes("popup")) {
      // make sure the target hovered over isn't a popup, but a marker
      // show the name of the place
      setHoverPlaceName(covidFeatures[0]?.properties?.name);
      setShowPlaceName(true);
    } else {
      // don't show anything
      setShowPlaceName(false);
      setHoverPlaceName("");
    }
  };

  /**
   * load the map marker image when the map loads
   */
  useEffect(() => {
    const map = mapRef.current.getMap();
    map.on("load", () => {
      map.loadImage("/map-pin.png", (error, image) => {
        if (error) throw error;
        if (!map.hasImage("map-pin")) {
          map.addImage("map-pin", image);
          console.log("image loaded");
        }
      });
    });
  }, [mapRef]);

  /**
   * functions returns JSX given the object with the covid statistics
   * @param {*} parsedData
   * @returns JSX for the popup with the covid statistics for the clicked placed
   */
  const getPopupBodyDataJSX = (parsedData) => {
    const dataToShow = [];
    const { Place: place } = parsedData;
    Object.entries(parsedData).forEach(([key, val]) => {
      dataToShow.push(`${key}: ${val}`);
    });
    const popupBodyJSX = dataToShow.map((row, idx) => (
      <div key={idx} className="popup-content-row">
        {row}
      </div>
    ));
    if (Object.keys(timeSeries).includes(place)) {
      const link = (
        <Link
          key={`${place}-time-series-link`}
          to={`/${place}`}
          className="popup-content-row"
        >
          TimeSeries
        </Link>
      );
      popupBodyJSX.push(link);
    }
    return popupBodyJSX;
  };

  /**
   * gets the covid statistics of a place with an api call
   * @param {String} place name of a place
   */
  const getPopupBodyData = async (place) => {
    const { url } = locations[selectedPlace];
    let parsedData;
    try {
      const res = await axios.get(url);
      parsedData = { Place: place, ...parseData(res.data, place) };
    } catch (err) {
      parsedData = { Place: place, error: err.message };
    }
    setPopupData({ popupData: parsedData, popupDataLoading: false });
  };

  return (
    <div className="map-container">
      <ReactMapGl
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle={mapbox_style}
        onViewportChange={(viewport) => {
          setViewport(viewport);
        }}
        ref={(el) => (mapRef.current = el)}
        interactiveLayerIds={["covidData"]}
        onClick={handleClick}
        onHover={handleHover}
      >
        <Source {...source}>
          <Layer {...layerStyle} />
        </Source>
        ;
        {selectedPlace ? (
          <Popup
            latitude={locations[selectedPlace].latitude}
            longitude={locations[selectedPlace].longitude}
            onClose={() => {
              setSelectedPlace(null);
            }}
          >
            {popupDataLoading ? "Loading..." : getPopupBodyDataJSX(popupData)}
          </Popup>
        ) : null}
        {showPlaceName && !(selectedPlace === hoverPlaceName) ? (
          <div className={"hover-name-popup-container"}>
            <Popup
              latitude={locations[hoverPlaceName].latitude}
              longitude={locations[hoverPlaceName].longitude}
              closebutton={false}
            >
              {hoverPlaceName}
            </Popup>
          </div>
        ) : null}
      </ReactMapGl>
      <button
        value="+"
        onClick={(e) => {
          e.preventDefault();
          const newZoom = viewport.zoom + 1;
          const max = viewport.maxZoom;
          setViewport({
            ...viewport,
            zoom: newZoom >= max ? viewport.maxZoom : newZoom,
          });
        }}
      >
        +
      </button>
      <button
        value="-"
        onClick={(e) => {
          e.preventDefault();
          const newZoom = viewport.zoom - 1;
          const min = viewport.minZoom;
          setViewport({ ...viewport, zoom: newZoom <= min ? min : newZoom });
        }}
      >
        -
      </button>
    </div>
  );
};

export default Map;
