import React, { useEffect, useRef } from "react";
import { Marker } from "react-map-gl";
import "./Markers.css";

const Markers = ({
  data,
  zoom,
  handleMarkerClick,
  handleMarkerMouseEnter,
  handleMarkerMouseLeave,
}) => {
  const markerRefs = useRef({});

  useEffect(() => {
    const initialMarkerRefs = {};
    data.forEach(([place]) => {
      initialMarkerRefs[`${place}`] = { style: { display: "" } };
    });
    markerRefs.current = initialMarkerRefs;
  }, []);

  useEffect(() => {
    const markers = markerRefs.current;
    data.forEach(([place, placeData], idx) => {
      const area = placeData.area;
      let shouldShow = true;
      if (area <= 1000000) {
        shouldShow = zoom >= 3 ? true : false;
      } else {
        shouldShow = zoom >= 3 ? false : true;
      }
      markers[place].style.display = shouldShow ? "block" : "none";
    });
    // console.log(markers);
    // console.log("hiding/revealing");
  });

  return (
    <React.Fragment>
      {data.map(([place, placeData], idx) => (
        <Marker
          key={idx}
          latitude={placeData.latitude}
          longitude={placeData.longitude}
        >
          <button
            className="marker-btn"
            id={`${place}-${idx}`}
            onClick={(e) => {
              e.preventDefault();
              // console.log(place);
              handleMarkerClick(place);
            }}
            ref={(el) => (markerRefs.current[`${place}`] = el)}
            onMouseEnter={(e) => {
              handleMarkerMouseEnter(e, place);
            }}
            onMouseLeave={handleMarkerMouseLeave}
          >
            <img src="/map-pin.svg" alt="red map location marker" />
          </button>
        </Marker>
      ))}
    </React.Fragment>
  );
};

export default React.memo(Markers);
