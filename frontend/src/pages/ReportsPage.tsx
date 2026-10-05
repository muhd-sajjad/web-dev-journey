import type { Expense } from "../types/expense.ts";
import CategoryPieChart from "../components/CategoryPieChart.tsx";
import SpendingBarChart from "../components/SpendingBarCharts.tsx";
import {
  getCategoryChartData,
  getDateChartData
} from "../utils/chartHelpers.ts";

interface ReportsPageProps {
  expenses: Expense[];
}

function ReportsPage({ expenses }: ReportsPageProps) {
  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalTransactions = expenses.length;
  const averageSpend =
    totalTransactions > 0 ? Math.round(totalAmount / totalTransactions) : 0;

  const highestExpense =
    expenses.length > 0
      ? expenses.reduce((max, item) => (item.amount > max.amount ? item : max))
      : null;

  const categoryChartData = getCategoryChartData(expenses);
  const dateChartData = getDateChartData(expenses);

  return (
    <>
      <section className="hero">
        <h1>Reports</h1>
        <p>Visual breakdown of your spending</p>
      </section>

      <section className="summary-grid">
        <div className="summary-card">
          <p>Total Spending</p>
          <h2>₹{totalAmount}</h2>
        </div>

        <div className="summary-card">
          <p>Total Transactions</p>
          <h2>{totalTransactions}</h2>
        </div>

        <div className="summary-card">
          <p>Average Spend</p>
          <h2>₹{averageSpend}</h2>
        </div>
      </section>

      {highestExpense && (
        <section className="report-highlight">
          <div className="summary-card">
            <p>Highest Expense</p>
            <h3>{highestExpense.title}</h3>
            <p>
              ₹{highestExpense.amount} • {highestExpense.category} •{" "}
              {highestExpense.date}
            </p>
          </div>
        </section>
      )}

      <section className="charts-grid">
        <CategoryPieChart data={categoryChartData} />
        <SpendingBarChart data={dateChartData} />
      </section>
    </>
  );
}

export default ReportsPage;