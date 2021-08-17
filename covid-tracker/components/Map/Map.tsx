import React, { useState, useEffect, useRef, useReducer } from "react";
import ReactMapGl, {
  Popup,
  Source,
  Layer,
  MapRef,
  SourceProps,
  LayerProps,
  MapEvent,
  FlyToInterpolator,
} from "react-map-gl";
import useAxiosAll from "../../customHooks/useAxiosAll";
import {
  formatData,
  YYYYMMDD_MMDDYYYY,
} from "../../utils/timeseries-constants";
import styles from "../../styles/Map.module.scss";
import Link from "next/link";
import { flagEmojiToPNG } from "../../utils/misc";
import Modal from "../Modal/Modal";
import PlaceTimeSeries from "../PlaceTimeSeries/PlaceTimeSeries";

interface Places {
  [key: string]: {
    latitude: number;
    longitude: number;
    [key: string]: any;
  };
}

interface MapProps {
  places: Places;
  searchPlace: string | null;
  mapStyle: {
    points: {
      [key: string]: {
        source: SourceProps;
        layer: LayerProps;
      };
    };
  };
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

const IS_CLIENT = typeof window !== "undefined";

const MAP_HEIGHT = "calc(100vh - var(--nav-height))";
const MAP_WIDTH = "100vw";

const MODAL_TB_BORDER_ROOM = "5vh";
const MODAL_LR_BORDER_ROOM = "2vw";
const timeSeriesModalStyles = {
  top: MODAL_TB_BORDER_ROOM,
  right: MODAL_TB_BORDER_ROOM,
  bottom: MODAL_TB_BORDER_ROOM,
  left: MODAL_LR_BORDER_ROOM,
  backgroundColor: "white",
  height: `calc(${MAP_HEIGHT}-2*${MODAL_TB_BORDER_ROOM})`,
  width: `calc(${MAP_WIDTH}-2*${MODAL_LR_BORDER_ROOM})`,
};

export default function Map({
  places,
  searchPlace,
  mapStyle: { points },
  popupDataToJSX,
  getPlaceBaseEndpoints,
  minDate,
  maxDate,
}: MapProps) {
  const [viewport, setViewport] = useState(
    IS_CLIENT ? getViewportFromSession() : INITIAL_VIEWPORT
  );

  const [showTimeSeriesModal, setShowTimeSeriesModal] = useState(false);

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
      place: IS_CLIENT
        ? getSelectedPlaceFromSession(Object.keys(places))
        : null,
      date: maxDate,
    });

  const { data, isLoading, isSuccess, allError } = useAxiosAll(
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
        return { place: action.place };
      case "hide":
        return { place: null };
      default:
        return state;
    }
  };

  const [{ place: hoverPlace }, dispatchHoverPlaceState] = useReducer(
    hoverPlaceReducer,
    {
      place: null,
    }
  );

  const selectedPlaceFlag = selectedPlace
    ? flagEmojiToPNG(places[selectedPlace].flag, {
        className: "popup-place-flag",
      })
    : null;
  const hoverPlaceFlag = hoverPlace
    ? flagEmojiToPNG(places[hoverPlace].flag, {
        className: "hover-popup-place-flag",
      })
    : null;

  /**
   * handles when user changes viewport by dragging, etc...
   * set to new viewport and save in session
   * @param viewport current viewport object
   */
  const handleViewportChange = (newViewport: Viewport) => {
    if (mapRef?.current?.getMap()) {
      setViewport(newViewport);
      sessionStorage.setItem("viewport", JSON.stringify(viewport));
    }
  };

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
    if (searchPlace && selectedPlace !== searchPlace) {
      setShowTimeSeriesModal(false);
      const { latitude, longitude } = places[searchPlace];
      dispatchSelectedPlaceState({ type: "set_place", place: searchPlace });
      setViewport((viewport: Viewport) => ({
        ...viewport,
        zoom: 4,
        latitude,
        longitude,
      }));
    }
  }, [searchPlace]);

  useEffect(() => {
    const sessionViewport = getViewportFromSession();
    setViewport({
      ...sessionViewport,
      transitionInterpolator: new FlyToInterpolator(),
    });
    const sessionSelectedPlace = getSelectedPlaceFromSession(
      Object.keys(places)
    );
    if (sessionSelectedPlace) {
      dispatchSelectedPlaceState({
        type: "set_place",
        place: sessionSelectedPlace,
      });
    }
    const keydownlistener = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const firstGrandChild = target?.firstChild?.firstChild as HTMLElement;
      if (e.key === "Escape" && firstGrandChild?.className === "mapboxgl-map") {
        dispatchSelectedPlaceState({ type: "clear" });
        setShowTimeSeriesModal(false);
        sessionStorage.removeItem("selectedPlace");
      }
    };
    const clicklistener = (e: MouseEvent) => {
      // need to add listener to close button for popup for closing it
      // because defining a callback for the onClose prop to close a popup
      // unfocuses the map for some reason
      const target = e.target as Element;
      if (target?.className == "mapboxgl-popup-close-button") {
        dispatchSelectedPlaceState({ type: "clear" });
        sessionStorage.removeItem("selectedPlace");
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
      sessionStorage.setItem("selectedPlace", firstFeatPlace);
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
    if (firstFeat && e.target.className.includes("overlay")) {
      // there is a valid feature and hovering over the map
      const { properties: { name: firstFeatPlace } = { name: null } } =
        firstFeat;
      if (hoverPlace !== firstFeatPlace || !hoverPlace) {
        // showing different place name or not showing anything at all
        dispatchHoverPlaceState({ type: "show", place: firstFeatPlace });
      }
    } else {
      // no valid feature or hovering over popup
      if (hoverPlace) {
        // currently showing a place, hide it else don't need to dispatch anything
        dispatchHoverPlaceState({ type: "hide" });
      }
    }
  };

  const handleTimeSeriesButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTimeSeriesModal(true);
  };

  return (
    <>
      <ReactMapGl
        {...viewport}
        mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE}
        onViewportChange={handleViewportChange}
        ref={(el) => (mapRef.current = el)}
        interactiveLayerIds={Object.keys(points)}
        onClick={handleMapClick}
        onHover={handleMapHover}
        height={MAP_HEIGHT}
        width={MAP_WIDTH}
      >
        {Object.values(points).map(({ source, layer }) => (
          <Source {...source} key={`${source.id}-${layer.id}`}>
            <Layer {...layer} key={`${layer.id}`} />
          </Source>
        ))}
        {selectedPlace && (
          <Popup
            className={styles["data-popup"]}
            latitude={places[selectedPlace].latitude}
            longitude={places[selectedPlace].longitude}
            anchor="left"
            dynamicPosition={true}
          >
            <div className={styles["popup-place-name-container"]}>
              <span className="popup-place-name">{`${selectedPlace}`}</span>
              {selectedPlaceFlag && (
                <div className={styles["popup-place-flag-container"]}>
                  {selectedPlaceFlag}
                </div>
              )}
            </div>
            {isLoading
              ? "Loading..."
              : !allError
              ? popupDataToJSX(data)
              : `Error getting data for ${selectedPlace}`}
            <div className={styles["popup-date-selector-container"]}>
              <label
                className="popup-date-selector-label"
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
            <Link
              href={selectedPlace ? `/${places[selectedPlace].slugs[0]}` : "/"}
            >
              <a className={styles["popup-time-series-link"]}>Time Series</a>
            </Link>
            <button
              className={styles["popup-time-series-modal-button"]}
              onClick={handleTimeSeriesButtonClick}
            >
              Time Series
            </button>
          </Popup>
        )}
        {hoverPlace && selectedPlace !== hoverPlace && (
          <Popup
            className={styles["hover-popup"]}
            latitude={places[hoverPlace!].latitude}
            longitude={places[hoverPlace!].longitude}
            closeButton={false}
          >
            <div className={styles["hover-popup-place-container"]}>
              <div
                className={styles["hover-popup-place-name"]}
              >{`${hoverPlace}`}</div>
              {hoverPlaceFlag && (
                <div className={styles["hover-popup-place-flag-container"]}>
                  {hoverPlaceFlag}
                </div>
              )}
            </div>
          </Popup>
        )}
      </ReactMapGl>
      {selectedPlace && showTimeSeriesModal && (
        <div
          className={styles["time-series-model-screen"]}
          style={{
            top: "var(--nav-height)",
            height: MAP_HEIGHT,
            width: MAP_WIDTH,
          }}
        >
          <div
            className={styles["time-series-modal-container"]}
            style={timeSeriesModalStyles}
          >
            <Link href={`/${places[selectedPlace].slugs[0]}`}>
              <a className={styles["time-series-modal-link"]}>
                View on separate page
              </a>
            </Link>
            <Modal setIsOpen={setShowTimeSeriesModal}>
              <PlaceTimeSeries
                placeName={selectedPlace}
                placeSlug={places[selectedPlace].slugs[0]}
                placeType={places[selectedPlace].place_type}
                flagEmoji={places[selectedPlace].flag}
                formatData={formatData}
              />
            </Modal>
          </div>
        </div>
      )}
      <div className={styles["zoom-buttons-container"]}>
        <button
          className={styles["zoom-in-button"]}
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
          className={styles["zoom-out-button"]}
          value="-"
          onClick={(e) => {
            e.preventDefault();
            const newZoom = viewport.zoom - 1;
            const min = viewport.minZoom;
            setViewport({ ...viewport, zoom: newZoom <= min ? min : newZoom });
          }}
        >
          {"\u2012"}
        </button>
      </div>
    </>
  );
}

function getSelectedPlaceFromSession(validPlaces: string[]) {
  const selectedPlace = sessionStorage.getItem("selectedPlace");
  // null
  if (!selectedPlace) return null;
  // valid string but not valid place
  if (!validPlaces.includes(selectedPlace)) return null;
  // valid place
  return selectedPlace;
}

function getViewportFromSession() {
  const viewportJson = sessionStorage.getItem("viewport");
  // no viewport in session
  if (!viewportJson) return INITIAL_VIEWPORT;
  // not falsy
  // validate it
  const viewport = JSON.parse(viewportJson);
  if (typeof viewport !== "object") return INITIAL_VIEWPORT;
  if (
    !viewport.hasOwnProperty("zoom") ||
    !viewport.hasOwnProperty("latitude") ||
    !viewport.hasOwnProperty("longitude")
  ) {
    return INITIAL_VIEWPORT;
  }
  // has zoom, lat and long
  // validate those as well
  const { zoom, latitude, longitude } = viewport;
  if (
    typeof zoom !== "number" ||
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    return INITIAL_VIEWPORT;
  }
  return viewport;
}
