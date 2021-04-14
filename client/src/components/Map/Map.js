import React, { useState, useEffect, useCallback } from "react";
import "./Map.css";
import ReactMapGl, { Marker, Popup } from "react-map-gl";
import { locations } from "../../data/locations";
import { Markers } from "../Markers/Markers";
import axios from "axios";

function parseWorldometers(data) {
  if (Object.keys(data).includes("message")) {
    const { message } = data;
    return { message: message };
  }
  const {
    cases,
    todayCases,
    deaths,
    todayDeaths,
    recovered,
    todayRecovered,
    active,
  } = data;
  const parsedData = {
    Cases: cases,
    "Today Cases": todayCases,
    Deaths: deaths,
    "Today Deaths": todayDeaths,
    Recovered: recovered,
    "Today Recovered": todayRecovered,
    Infected: active,
  };
  return parsedData;
}

function parseJHUCSSE(data, place) {
  // console.log(place);
  // console.log(data);
  const filteredPlaces = data.filter(
    (placeData) => placeData.province === place
  );
  if (filteredPlaces.length !== 1) {
    return { message: `Covid data for ${place} not found.` };
  }

  const specificPlaceData = filteredPlaces[0];
  const { confirmed, deaths, recovered } = specificPlaceData.stats;
  const parsedData = {
    Confirmed: confirmed,
    Deaths: deaths,
    Recovered: recovered,
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
    zoom: 0,
  };
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  // const markers = useRef({});
  const [selectedPlace, setSelectedPlace] = useState(null);
  // const [popupDataLoading, setPopupDataLoading] = useState(true);
  const [{ popupData, loading }, setPopupData] = useState({
    popupData: null,
    loading: true,
  });

  const handleMarkerClick = useCallback(
    (place) => {
      setSelectedPlace(place);
      setPopupData({ popupData: null, loading: true });
    },
    [setSelectedPlace, setPopupData]
  );

  useEffect(() => {
    if (selectedPlace) {
      getPopupData(selectedPlace);
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

  const getPopupInside = (data) => {
    const dataToShow = [];
    Object.entries(data).forEach(([statistic, number]) => {
      dataToShow.push(`${statistic}: ${number}`);
    });

    return dataToShow.map((row, idx) => <div key={idx}>{row}</div>);
  };

  const getPopupData = async (place) => {
    const { url } = locations[selectedPlace];
    let parsedData;
    try {
      const res = await axios.get(url);
      parsedData = { Place: place, ...parseData(res.data, place) };
    } catch (err) {
      parsedData = { Place: place, error: err.message };
    }
    console.log(parsedData);
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
        />
        {selectedPlace ? (
          <Popup
            latitude={locations[selectedPlace].latitude}
            longitude={locations[selectedPlace].longitude}
            onClose={() => {
              setSelectedPlace(null);
            }}
          >
            {loading ? "Loading..." : getPopupInside(popupData)}
          </Popup>
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

// {
//   Object.entries(locations).map(([place, placeData], idx) => (
//     <Marker
//       key={idx}
//       latitude={placeData.latitude}
//       longitude={placeData.longitude}
//     >
//       <button
//         className="marker-btn"
//         id={`${place}-${idx}`}
//         onClick={(e) => {
//           e.preventDefault();
//           console.log(e.currentTarget.id);
//           console.log({ place, ...placeData });
//           console.log(viewport.zoom);
//         }}
//         ref={(el) => (markers.current[`${place}`] = el)}
//       >
//         <img src="/map-pin.svg" />
//       </button>
//     </Marker>
//   ));
// }
export default Map;
