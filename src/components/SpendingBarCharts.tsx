import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import type { DateChartItem } from "../utils/chartHelpers.ts";

interface SpendingBarChartProps {
  data: DateChartItem[];
}

function SpendingBarChart({ data }: SpendingBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No spending trend data available.</p>
      </div>
    );
  }

  return (
    <div className="chart-box">
      <h3>Spending by Date</h3>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value}`, "Amount"] as [string, string]} />
            <Bar dataKey="amount" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SpendingBarChart;    