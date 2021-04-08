import { locations } from "../data/locations.js";
import capitalizeSeparateWords from "..//capitalizeSeparateWords.js";
import axios from "axios";

function parseWorldometers(data) {
  const {
    cases,
    todayCases,
    deaths,
    todayDeaths,
    recovered,
    todayRecovered,
  } = data;
  const parsedData = {
    cases,
    todayCases,
    deaths,
    todayDeaths,
    recovered,
    todayRecovered,
  };
  return parsedData;
}

function parseJHUCSSE(data) {
  const { confirmed, deaths, recovered } = data.stats;
  const parsedData = { confirmed, deaths, recovered };
  return parsedData;
}

export const getMapPlaceInfo = async (req, res) => {
  if (req.url === "/favicon.ico") {
    res.writeHead(200, { "Content-Type": "image/x-icon" });
    res.end();
    console.log("favicon requested");
    return;
  } else {
    const place = req.params.place;
    const formattedPlace = capitalizeSeparateWords(place);
    if (!Object.keys(locations).includes(formattedPlace)) {
      res
        .staus(400)
        .send({ message: "Sorry no covid data about that place available" });
    }
    const { api, url } = locations[formattedPlace];
    try {
      const response = await axios.get(url);
      const data = response.data;
      if (api === "Worldometers") {
        const parsedData = parseWorldometers(data);
        res.status(200).send({ formattedPlace, api, url, data: parsedData });
      } else {
        const placeData = data.filter((obj) => obj.province === formattedPlace);
        if (placeData.length !== 1) {
          res.status(400).send({
            message: "Didn't find exact province",
          });
        } else {
          const parsedData = parseJHUCSSE(placeData[0]);
          res.status(200).send({
            formattedPlace,
            api,
            url,
            data: parsedData,
          });
        }
      }
    } catch (err) {
      res.staus(400).send({ message: err });
    }
  }
};
