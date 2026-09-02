import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import type { CategoryChartItem } from "../utils/chartHelpers.ts";

interface CategoryPieChartProps {
  data: CategoryChartItem[];
}

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ea580c"
];

function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No category data available.</p>
      </div>
    );
  }

  return (
    <div className="chart-box">
      <h3>Spending by Category</h3>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label
            >
              {data.map((item: CategoryChartItem, index: number): React.ReactElement => (
                <Cell
                key={`cell-${item.name}-${index}`}
                fill={COLORS[index % COLORS.length] as string}
                />
                ))}
            </Pie>
            <Tooltip formatter={(value) => [`₹${value}`, "Amount"] as [string, string]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CategoryPieChart;