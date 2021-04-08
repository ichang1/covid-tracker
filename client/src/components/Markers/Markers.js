import React, { useEffect, useRef } from "react";
import { Marker } from "react-map-gl";
import "./Markers.css";
import axios from "axios";

export const Markers = React.memo(({ data, zoom }) => {
  // const markerData = data.map(([place, placeData]) => {
  //   return { ...placeData, place };
  // });

  const markerRefs = useRef({});
  const markerData = useRef({});

  useEffect(() => {
    const initialMarkerRefs = {};
    data.forEach(([place, placeData]) => {
      initialMarkerRefs[`${place}`] = { style: { display: "" } };
    });
    markerRefs.current = initialMarkerRefs;
  }, []);

  useEffect(() => {
    const backendBaseUrl = "https://localhost:5000";
    data.forEach(([place, placeData]) => {
      const url = encodeURI(`${backendBaseUrl}/${place}`);
      console.log(url);
    });
    // try {
    //   Promise.all(
    //     data.map(([place, { api, url }]) =>
    //       axios.get(url).then((res) => {
    //         // do something with response
    //         let placeCovidData = {};
    //         if (api === "Worldometers") {
    //           placeCovidData = res.data;
    //         } else {
    //           placeCovidData = res.data.filter((e) => e.province === place)[0];
    //         }
    //         markerData.current[`${place}`] = { api, data: placeCovidData };
    //       })
    //     )
    //   );
    // } catch (e) {
    //   console.log(e.message);
    // }
    // console.log(markerData.current);
  }, []);

  useEffect(() => {
    const markers = markerRefs.current;
    data.forEach(([place, placeData], idx) => {
      const area = placeData.area;
      let shouldShow = true;
      if (area <= 2000000) {
        shouldShow = zoom >= 3 ? true : false;
      } else {
        shouldShow = zoom >= 3 ? false : true;
      }
      markers[place].style.display = shouldShow ? "block" : "none";
    });
  }, [zoom]);

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
              console.log(e.currentTarget.id);
              console.log(placeData);
              console.log(zoom);
            }}
            ref={(el) => (markerRefs.current[`${place}`] = el)}
          >
            <img src="/map-pin.svg" />
          </button>
        </Marker>
      ))}
    </React.Fragment>
  );
});
