import "./App.css";
import Map from "../Map/Map";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { locations } from "../../data/locations";
import { timeSeries } from "../../data/timeSeries";
import { vaccine } from "../../data/vaccine";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Map} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
