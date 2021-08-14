import React, { ReactText, useReducer } from "react";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
  LegendType,
} from "recharts";
import { Data, LineStyle } from "../utils/types";
import styles from "../../../styles/TimeSeriesGraph.module.scss";

interface TimeSeriesGraphProps {
  data: Data[];
  chartStyle: {
    xAxis: {
      dataKey: string;
    };
    yAxis: {
      Line: LineStyle[];
    };
  };
}

interface LineShowState {
  [key: string]: boolean;
}

type LineShowStateAction = { type: "toggle"; dataKey: string };

function lineShowStateReducer(
  state: LineShowState,
  action: LineShowStateAction
) {
  switch (action.type) {
    case "toggle":
      const dataKeyState = state[action.dataKey];
      return { ...state, [action.dataKey]: !dataKeyState };
    default:
      return state;
  }
}
export default function TimeSeriesGraph({
  data,
  chartStyle: { xAxis, yAxis },
}: TimeSeriesGraphProps) {
  const [lineShowState, dispatchLineShowState] = useReducer(
    lineShowStateReducer,
    yAxis.Line.reduce((cur, { dataKey }) => ({ ...cur, [dataKey]: true }), {})
  );

  const handleLegendClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement) {
      const dataKeyClicked = e.target.dataset?.datakey;
      if (dataKeyClicked) {
        dispatchLineShowState({ type: "toggle", dataKey: dataKeyClicked });
      }
    }
  };

  const filterData = (data: Data[]) => {
    const filtered = data.map((linePointData) => {
      // for each group of points at x=X
      const xPoints = Object.entries(linePointData);
      const filteredXPoints: { [key: string]: any } = {};
      // only keep the key values that are user wants to see or is the x-axis value
      xPoints.forEach(([dataKey, value]) => {
        if (lineShowState[dataKey] || xAxis.dataKey === dataKey) {
          filteredXPoints[dataKey] = value;
        }
      });

      return filteredXPoints;
    });
    return filtered;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className={styles["chart-legend-list"]}>
        {payload.map((entry: any, index: any) => {
          const {
            value,
            payload: { stroke },
            dataKey,
          } = entry;
          return (
            <li
              key={`chart-legend-item-${index}`}
              className={styles["chart-legend-item-wrapper"]}
            >
              <button
                className={styles["chart-legend-item"]}
                style={{
                  color: lineShowState[dataKey] ? "white" : stroke,
                  backgroundColor: lineShowState[dataKey] ? stroke : "white",
                  border: `1px solid ${stroke}`,
                }}
                onClick={handleLegendClick}
                data-datakey={dataKey}
              >
                {value}
              </button>
            </li>
          );
        })}
      </ul>
    );
  };
  return (
    <>
      <ResponsiveContainer width="90%" height="100%">
        <LineChart
          data={filterData(data)}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxis.dataKey} />
          <YAxis />
          <Tooltip />
          <Legend className={styles["legend"]} content={renderLegend} />
          {yAxis.Line.map(({ dataKey, strokeColor }) => (
            <Line
              dot={false}
              type="monotone"
              dataKey={dataKey}
              stroke={strokeColor}
              key={`${dataKey}-${strokeColor}`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
