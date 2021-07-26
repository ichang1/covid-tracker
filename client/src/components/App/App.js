import "./App.css";
import Map from "../Map/Map";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import TimeSeries from "../TimeSeries/TimeSeries";

import { timeSeries } from "../../data/timeSeries";

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
          <Route
            path="*"
            render={() => (
              <div className="error-page-container">
                <h1 style={{ textAlign: "center" }}>404 Error</h1>
                <h2 style={{ textAlign: "center" }}>
                  Page not found. Invalid URL.
                </h2>
              </div>
            )}
          />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
