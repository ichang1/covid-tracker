import React, { useState, useEffect, useRef } from "react";
import "./Map.css";
import ReactMapGl, { Marker } from "react-map-gl";
import { locations } from "../../data/locations";
import { Markers } from "../Markers/Markers";

const Map = () => {
  const INITIAL_VIEWPORT = {
    latitude: 0,
    longitude: 0,
    width: "80vw",
    height: "80vh",
    zoom: 0,
  };
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const markers = useRef({});

  // useEffect(() => {
  //   const initialMarkers = {};
  //   Object.entries(locations).forEach(([place, placeData]) => {
  //     initialMarkers[`${place}`] = null;
  //   });
  //   markers.current = initialMarkers;
  //   console.log(markers);
  // }, []);

  // useEffect(() => {
  //   Object.keys(markers.current).map((placeName) => {
  //     const placeArea = locations.data[placeName].area;
  //     console.log(placeName, placeArea);
  //   });
  // }, [viewport]);

  const mapbox_style =
    "mapbox://styles/isaacc/ckmcxu2s609qb17rwla4bcixc?optimize=true";
  const getMarkerLocations = () => {};
  return (
    <div className="map-container">
      <ReactMapGl
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle={mapbox_style}
        onViewportChange={(viewport) => {
          setViewport(viewport);
          console.log(viewport);
        }}
      >
        <Markers data={Object.entries(locations)} zoom={viewport.zoom} />
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
