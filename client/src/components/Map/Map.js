import React, { useState } from "react";
import "./Map.css";
import ReactMapGl, { Marker } from "react-map-gl";
import locations from "../../data/locations";

const Map = () => {
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    width: "80vw",
    height: "80vh",
    zoom: 1.5,
  });
  const mapbox_style = "mapbox://styles/isaacc/ckmcxu2s609qb17rwla4bcixc";
  const getMarkerLocations = () => {};
  return (
    <div className="map-container">
      <ReactMapGl
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle={mapbox_style}
        onViewportChange={(viewport) => {
          setViewport(viewport);
        }}
      ></ReactMapGl>
    </div>
  );
};

export default Map;
