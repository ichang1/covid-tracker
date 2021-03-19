export const getMapInfo = (req, res) => {
  const place = req.params.place;
  res.send(place);
};
