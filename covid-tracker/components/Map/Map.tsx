import React, { useState, useEffect, useRef, useReducer } from "react";
import ReactMapGl, {
  Popup,
  Source,
  Layer,
  MapRef,
  SourceProps,
  LayerProps,
  MapEvent,
} from "react-map-gl";
import useAxiosAll from "../../customHooks/useAxiosAll";
import { YYYYMMDD_MMDDYYYY } from "../../utils/timeseries-constants";
import styles from "../../styles/Map.module.css";

interface Places {
  [key: string]: {
    latitude: number;
    longitude: number;
    [key: string]: any;
  };
}

interface MapProps {
  places: Places;
  mapStyle: {
    points: {
      [key: string]: {
        source: SourceProps;
        layer: LayerProps;
      };
    };
  };
  // handleMapClick: (e: MapEvent) => void;
  // handleMapHover: (e: MapEvent) => void;
  popupDataToJSX: (data: any) => JSX.Element;
  getPlaceBaseEndpoints: (place: string) => string[];
  minDate: string;
  maxDate: string;
}

interface Viewport {
  [key: string]: any;
}

interface SelectedPlaceState {
  place: string | null;
  date: string;
}

type SelectedPlaceAction =
  | { type: "set_place"; place: string }
  | { type: "set_date"; date: string }
  | { type: "clear" };

interface HoverPlaceState {
  place: string | null;
  showPlace: boolean;
}

type HoverPlaceAction = { type: "show"; place: string } | { type: "hide" };

const INITIAL_VIEWPORT: Viewport = {
  latitude: 0,
  longitude: 0,
  zoom: 0.5,
};

function getFullEndpoint(baseEndpoint: string, date: string) {
  //YYYY-MM-DD -> MM-DD-YYYY
  const dateFormatted = YYYYMMDD_MMDDYYYY(date);
  const fullEndpoint = `${baseEndpoint}?date=${dateFormatted}`;
  return fullEndpoint;
}

export default function Map({
  places,
  mapStyle: { points },
  popupDataToJSX,
  getPlaceBaseEndpoints,
  minDate,
  maxDate,
}: MapProps) {
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);

  const selectedPlaceReducer = (
    state: SelectedPlaceState,
    action: SelectedPlaceAction
  ): SelectedPlaceState => {
    switch (action.type) {
      case "set_place":
        return { place: action.place, date: maxDate };
      case "set_date":
        return { ...state, date: action.date };
      case "clear":
        return { place: null, date: maxDate };
      default:
        return state;
    }
  };

  const [{ place: selectedPlace, date }, dispatchSelectedPlaceState] =
    useReducer(selectedPlaceReducer, {
      place: null,
      date: maxDate,
    });

  const { data, isLoading, isSuccess } = useAxiosAll(
    getPlaceBaseEndpoints(selectedPlace!).map((url) => ({
      key: [url, date],
      url: getFullEndpoint(url, date),
      enabled: selectedPlace !== null,
    }))
  );

  const hoverPlaceReducer = (
    state: HoverPlaceState,
    action: HoverPlaceAction
  ) => {
    switch (action.type) {
      case "show":
        return { place: action.place, showPlace: true };
      case "hide":
        return { place: null, showPlace: false };
      default:
        return state;
    }
  };

  const [
    { place: hoverPlace, showPlace: showHoverPlace },
    dispatchHoverPlaceState,
  ] = useReducer(hoverPlaceReducer, {
    place: null,
    showPlace: false,
  });

  const mapRef = useRef<MapRef | null>(null);

  /**
   * load the map marker image when the map loads
   */
  useEffect(() => {
    const map = mapRef?.current?.getMap();
    if (map) {
      map.on("load", () => {
        map.loadImage("/map-pin.png", (error: Error, image: File) => {
          if (error) throw error;
          if (!map.hasImage("map-pin")) {
            map.addImage("map-pin", image);
            console.log("image loaded");
          }
        });
      });
    }
  }, [mapRef]);

  useEffect(() => {
    const keydownlistener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatchSelectedPlaceState({ type: "clear" });
      }
    };
    const clicklistener = (e: MouseEvent) => {
      // need to add listener to close button for popup for closing it
      // because defining a callback for the onClose prop to close a popup
      // unfocuses the map for some reason
      const target = e.target as Element;
      if (target?.className == "mapboxgl-popup-close-button") {
        dispatchSelectedPlaceState({ type: "clear" });
      }
    };
    window.addEventListener("keydown", keydownlistener);
    window.addEventListener("click", clicklistener);
    return () => {
      window.removeEventListener("keydown", keydownlistener);
      window.removeEventListener("click", clicklistener);
    };
  }, []);

  const handleMapClick = (e: MapEvent) => {
    const { features } = e;
    if (!features) {
      // for some reason there are no features
      return;
    }
    const sourcesSet = new Set(Object.keys(points));
    const firstFeat = features.find(({ source }) => sourcesSet.has(source));
    if (!firstFeat) {
      // there are no valid features
      return;
    }
    const { properties: { name: firstFeatPlace } = { name: null } } = firstFeat;
    if (firstFeatPlace !== selectedPlace) {
      // if the clicked place isn't the same as the current selected place
      dispatchSelectedPlaceState({ type: "set_place", place: firstFeatPlace });
    }
  };

  const handleMapHover = (e: MapEvent) => {
    const { features } = e;
    if (!features) {
      // for some reason there are no features
      return;
    }
    // have array of features
    const sourcesSet = new Set(Object.keys(points));
    const firstFeat = features.find(({ source }) => sourcesSet.has(source));
    if (
      firstFeat !== (null || undefined) &&
      !e.target.className.includes("popup")
    ) {
      // there is a valid feature and not hovering over the popoup
      const { properties: { name: firstFeatPlace } = { name: null } } =
        firstFeat;
      if (hoverPlace !== firstFeatPlace || !showHoverPlace) {
        // showing different place name or not showing anything at all
        dispatchHoverPlaceState({ type: "show", place: firstFeatPlace });
      }
    } else {
      // no valid feature or hovering over popup
      if (showHoverPlace) {
        // currently showing a place, hide it else don't need to dispatch anything
        dispatchHoverPlaceState({ type: "hide" });
      }
    }
  };

  return (
    <>
      <ReactMapGl
        {...viewport}
        mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE}
        onViewportChange={(viewport: Viewport) => {
          setViewport(viewport);
        }}
        ref={(el) => (mapRef.current = el)}
        interactiveLayerIds={Object.keys(points)}
        onClick={handleMapClick}
        onHover={handleMapHover}
        height="80vh"
        width="100vw"
      >
        {Object.values(points).map(({ source, layer }) => (
          <Source {...source} key={`${source.id}-${layer.id}`}>
            <Layer {...layer} />
          </Source>
        ))}
        {selectedPlace ? (
          <Popup
            className={styles["popup"]}
            latitude={places[selectedPlace].latitude}
            longitude={places[selectedPlace].longitude}
          >
            <div className={styles["popup-place-name-container"]}>
              <span className="popup-place-name">{selectedPlace}</span>
            </div>
            {isLoading
              ? "Loading..."
              : isSuccess
              ? popupDataToJSX(data)
              : `Error getting data for ${selectedPlace}`}
            <div className={styles["popup-date-selector-container"]}>
              <label
                className={styles["popup-date-selector-label"]}
                htmlFor="popup-date-selector"
              >
                Date:
              </label>
              <input
                className={styles["popup-date-selector"]}
                name="popup-date-selector"
                type="date"
                onChange={(e) => {
                  e.preventDefault();
                  dispatchSelectedPlaceState({
                    type: "set_date",
                    date: e.target.value,
                  });
                }}
                value={date}
                min={minDate}
                max={maxDate}
                id="popup-date-selector"
              />
            </div>
          </Popup>
        ) : null}
        {showHoverPlace && selectedPlace !== hoverPlace ? (
          <div className={styles["hover-name-popup-container"]}>
            <Popup
              latitude={places[hoverPlace!].latitude}
              longitude={places[hoverPlace!].longitude}
              closeButton={false}
            >
              {hoverPlace}
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
    </>
  );
}
