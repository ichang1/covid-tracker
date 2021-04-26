import { locations } from "../../data/locations";

export const source = {
  id: "covidData",
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: Object.keys(locations).map((place) => {
      const { latitude, longitude } = locations[place];
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        properties: {
          name: place,
        },
      };
    }),
  },
};

export const layerStyle = {
  id: "covidData",
  type: "symbol",
  source: "covidData",
  layout: {
    "icon-image": "map-pin",
    "icon-allow-overlap": true,
    "icon-size": {
      stops: [...Array(20).keys()].map((i) => [0.5 * i, 0.1 * Math.sqrt(i)]),
    },
  },
};
