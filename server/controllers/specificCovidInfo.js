export const getSpecificCovidInfo = (req, res) => {
  const place = req.params.place;
  res.send(place);
};
