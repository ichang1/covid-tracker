The site is live at [https://global-coronavirus-tracker.vercel.app/](https://global-coronavirus-tracker.vercel.app/)

The site's main page consists of an interactive map similar to google maps
with clickable predetermined locations. When these locations are clicked on
you are able to see a coronavirus related statistics popup for that
place for a certain day within a valid time frame. Within each popup, there
is a date input allowing you to view the statistics for another day.

Each place also has a corresponding page accessible from its corresponding
popup from the map. These pages consist of timeseries plots detailing the
cumulative/daily change in the number of cases/deaths/recovered/vaccine dosages
for that place.

Note that the data source the data comes from doesn't always provide valid
data. These statistics will be labeled as 0 or some other invalid number.
