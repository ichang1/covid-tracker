import locationsApi from "../data/locationsApi.js";

export const getMapPlaceInfo = (req, res) => {
  const place = req.params.place;
  console.log(place);
  console.log(locationsApi[place]);
  const api = locationsApi[place].api;
  const url = locationsApi[place].path;
  res.send({ place, api, url });
};
