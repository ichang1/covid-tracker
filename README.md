# Global Coronavirus Tracker

The site is live at [https://global-coronavirus-tracker.vercel.app/](https://global-coronavirus-tracker.vercel.app/)

The site's main page consists of an interactive map similar to google maps
with clickable predetermined locations. When these locations are clicked on
you are able to see a coronavirus related statistics popup for that
place for a certain day within a valid time frame. Within each popup, there
is a date input allowing you to view the statistics for another day.

Each place also has a corresponding page accessible from its corresponding
popup from the map. These pages consist of timeseries plots detailing the
cumulative/daily change in the number of cases/deaths/recovered/vaccine dosages for that place.

Note that the data source the data comes from doesn't always provide valid
data. These statistics will be labeled as 0 or some other invalid number. The data comes from the Johns Hopkins Api and the Regulatory Affairs Professional Society (RAPS) Api which is collected from [disease.sh](https://disease.sh/).

# Install and Start

1. Clone the repository `git clone https://github.com/ichang1/covid-tracker.git`
2. Enter the root of the Next project `cd covid-tracker/covid-tracker`
3. Install the dependencies `npm install`
4. Start the project locally `npm run dev`
