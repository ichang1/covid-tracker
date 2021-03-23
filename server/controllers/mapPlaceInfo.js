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
    if (api === "Worldometers") {
      res.send({ formattedPlace, api, path, data });
    } else {
      const placeData = data.filter((obj) => obj.province === formattedPlace);
      if (placeData.length !== 1) {
        res.status(400).send({
          message: "Didn't find exact province",
        });
      } else {
        const filteredData = placeData[0];
        res.send({
          formattedPlace,
          api,
          path,
          data: filteredData,
        });
      }
    }
  }
};
