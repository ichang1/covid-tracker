import React, { useState, useEffect, useCallback } from "react";
import "./Map.css";
import ReactMapGl, { Marker, Popup } from "react-map-gl";
import { locations } from "../../data/locations";
import Markers from "../Markers/Markers";
import axios from "axios";

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

function parseJHUCSSE(data, place) {
  const filteredPlaces = data.filter(
    (placeData) => placeData.province === place
  );
  if (filteredPlaces.length !== 1) {
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

function parseData(data, place) {
  const { api } = locations[place];
  const parsedData =
    api === "Worldometers"
      ? parseWorldometers(data)
      : parseJHUCSSE(data, place);
  return parsedData;
}

const Map = () => {
  const INITIAL_VIEWPORT = {
    latitude: 0,
    longitude: 0,
    width: "80vw",
    height: "80vh",
    zoom: 0.75,
  };
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [{ popupData, loading }, setPopupData] = useState({
    popupData: null,
    loading: true,
  });
  const [hoverPlaceName, setHoverPlaceName] = useState("asd");
  const [showPlaceName, setShowPlaceName] = useState(null);

  const handleMarkerClick = useCallback(
    (place) => {
      setSelectedPlace(place);
      setPopupData({ popupData: null, loading: true });
    },
    [setSelectedPlace, setPopupData]
  );

  const handleMarkerMouseEnter = useCallback(
    (e, place) => {
      setHoverPlaceName(place);
      setShowPlaceName(true);
    },
    [setHoverPlaceName, setShowPlaceName]
  );

  const handleMarkerMouseLeave = useCallback(() => {
    setHoverPlaceName("");
    setShowPlaceName(false);
  }, [setHoverPlaceName, setShowPlaceName]);

  useEffect(() => {
    if (selectedPlace) {
      getPopupBody(selectedPlace);
    }
  }, [selectedPlace]);

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

  const getPopupBodyHTML = (data) => {
    const dataToShow = [];
    Object.entries(data).forEach(([statistic, number]) => {
      dataToShow.push(`${statistic}: ${number}`);
    });

    return dataToShow.map((row, idx) => <div key={idx}>{row}</div>);
  };

  const getPopupBody = async (place) => {
    const { url } = locations[selectedPlace];
    let parsedData;
    try {
      const res = await axios.get(url);
      parsedData = { Place: place, ...parseData(res.data, place) };
    } catch (err) {
      parsedData = { Place: place, error: err.message };
    }
    setPopupData({ popupData: parsedData, loading: false });
  };

  const mapbox_style =
    "mapbox://styles/isaacc/ckmcxu2s609qb17rwla4bcixc?optimize=true";

  return (
    <div className="map-container">
      <ReactMapGl
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle={mapbox_style}
        onViewportChange={(viewport) => {
          setViewport(viewport);
          // console.log(viewport);
        }}
      >
        <Markers
          data={Object.entries(locations)}
          zoom={viewport.zoom}
          handleMarkerClick={handleMarkerClick}
          handleMarkerMouseEnter={handleMarkerMouseEnter}
          handleMarkerMouseLeave={handleMarkerMouseLeave}
        />
        {selectedPlace ? (
          <Popup
            latitude={locations[selectedPlace].latitude}
            longitude={locations[selectedPlace].longitude}
            onClose={() => {
              setSelectedPlace(null);
            }}
          >
            {loading ? "Loading..." : getPopupBodyHTML(popupData)}
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
        ) : // <div
        //   style={{
        //     left: `${mouseX}px`,
        //     top: `${mouseY}px`,
        //     background: "white",
        //   }}
        // >
        //   {hoverPlaceName}
        // </div>
        null}
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
