import "./App.css";
import Map from "../Map/Map";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import TimeSeries from "../TimeSeries/TimeSeries";

import { locations } from "../../data/locations";
import { timeSeries } from "../../data/timeSeries";
import { vaccine } from "../../data/vaccine";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Map} />
          {Object.keys(timeSeries).map((place) => (
            <Route
              key={`${place}-time-series-route`}
              path={`/${place}`}
              render={(props) => (
                <TimeSeries
                  key={`${place}-time-series`}
                  {...props}
                  place={place}
                />
              )}
            />
          ))}
          <Route path="/" render={() => <div>404</div>} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
