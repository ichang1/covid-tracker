import React from "react";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
} from "recharts";
import { Data, LineStyle } from "../utils/types";

interface TimeSeriesGraphProps {
  data: Data[];
  chartStyle: {
    XAxis: {
      dataKey: string;
    };
    YAxis: {
      Line: LineStyle[];
    };
  };
}

export default function TimeSeriesGraph({
  data,
  chartStyle,
}: TimeSeriesGraphProps) {
  return (
    <>
      <ResponsiveContainer width="90%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={chartStyle.XAxis.dataKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {chartStyle.YAxis.Line.map(({ dataKey, strokeColor }) => (
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
