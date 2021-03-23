import locationsApi from "../data/locationsApi.js";
import capitalizeSeparateWords from "..//capitalizeSeparateWords.js";
import axios from "axios";

export const getMapPlaceInfo = async (req, res) => {
  if (req.url === "/favicon.ico") {
    res.writeHead(200, { "Content-Type": "image/x-icon" });
    res.end();
    console.log("favicon requested");
    return;
  } else {
    const place = req.params.place;
    const formattedPlace = capitalizeSeparateWords(place);
    const { api, path } = locationsApi[formattedPlace];
    const response = await axios.get(path);
    const data = response.data;
    res.send({ formattedPlace, api, path, data });
  }
};
