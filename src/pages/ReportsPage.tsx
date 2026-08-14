import type { Expense } from '../types/expense.js';
interface ReportsPageProps {
  expenses: Expense[];
}
function ReportsPage({ expenses }: ReportsPageProps) {
  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

  const categoryTotals = expenses.reduce((acc: Record<string, number>, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  return (
    <>
      <section className="hero">
        <h1>Reports</h1>
        <p>Simple breakdown of your spending</p>
      </section>

      <div className="summary-card" style={{ marginBottom: "24px" }}>
        <h3>Total Spending</h3>
        <p>₹{totalAmount}</p>
      </div>

      <section>
        <h2>Category Breakdown</h2>

        <div className="expense-grid">
          {Object.entries(categoryTotals).map(([category, amount]) => (
            <div key={category} className="expense-card">
              <h3>{category}</h3>
              <p>₹{amount}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default ReportsPage;