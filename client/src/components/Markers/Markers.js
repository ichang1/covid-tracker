import React, { useEffect, useRef } from "react";
import { Marker } from "react-map-gl";
import "./Markers.css";

export const Markers = React.memo(({ data, zoom, handleMarkerClick }) => {
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
  }, [data]);

  // useEffect(() => {
  //   const backendBaseUrl = "https://localhost:5000";
  //   // data.forEach(([place, placeData]) => {
  //   //   const url = encodeURI(`${backendBaseUrl}/${place}`);
  //   //   console.log(url);
  //   // });
  //   try {
  //     Promise.all(
  //       data.map(([place, placeData]) => {
  //         axios.get(encodeURI(`${backendBaseUrl}/${place}`)).then((res) => {
  //           // console.log(res.data);
  //           // markerData.current[`${place}`] = { ...res.data };
  //         });
  //       })
  //     ).then((res) => {
  //       console.log(res.data);
  //     });
  //   } catch (e) {
  //     console.log(e.message);
  //   }
  //   console.log(markerData.current);
  // }, [data]);
  // useEffect(() => {
  //   console.log(markerRefs.current);
  // }, [markerRefs.current]);

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

  // const handleOnClick = useCallback(
  //   (e) => {
  //     e.preventDefault();
  //     // console.log(place);
  //     handleMarkerClick(place);
  //   },
  //   [handleMarkerClick]
  // );

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
          >
            <img src="/map-pin.svg" alt="red map location marker" />
          </button>
        </Marker>
      ))}
    </React.Fragment>
  );
});
