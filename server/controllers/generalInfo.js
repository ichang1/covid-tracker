export const getGeneralContinentInfo = (req, res) => {
  const place = req.params.place;
  res.send(place);
};
