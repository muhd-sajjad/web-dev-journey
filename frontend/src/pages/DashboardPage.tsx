import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SummaryCard from "../components/summarycard.tsx";
import ExpenseCard from "../components/ExpenseCard.tsx";
import type { Expense, SortBy } from "../types/expense.ts";
import {
  getCategoryOptions,
  filterExpenses,
  sortExpenses,
  getExpenseSummary
} from "../utils/expenseHelpers.ts";

interface DashboardPageProps {
  expenses: Expense[];
  onDeleteExpense: (id: number) => void | Promise<void>;
}

function DashboardPage({ expenses, onDeleteExpense }: DashboardPageProps) {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  function handleEditExpense(id: number) {
    navigate(`/expenses/${id}/edit`);
  }

  const categoryOptions = getCategoryOptions(expenses);

  const filteredExpenses = filterExpenses(expenses, {
    category: filter,
    search: searchTerm
  });

  const sortedExpenses = sortExpenses(filteredExpenses, sortBy);

  const { totalAmount, highExpenseCount, totalCategories } =
    getExpenseSummary(sortedExpenses);

  return (
    <>
      <section className="hero">
        <h1>Dashboard</h1>
        <p>Your expenses overview</p>
      </section>

      <section className="toolbar-card">
        <div className="search-sort-row">
          <input
            type="text"
            placeholder="Search by title or category"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortBy)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amount-high">Amount: High to Low</option>
            <option value="amount-low">Amount: Low to High</option>
            <option value="title-az">Title: A to Z</option>
            <option value="title-za">Title: Z to A</option>
          </select>
        </div>
      </section>

      <section className="summary-grid">
        <SummaryCard label="Total Expense" value={`₹${totalAmount}`} />
        <SummaryCard label="High Expenses" value={highExpenseCount} />
        <SummaryCard label="Categories" value={totalCategories} />
      </section>

      <section>
        <h2>Expense List</h2>

        {sortedExpenses.length === 0 ? (
          <p>No expenses found.</p>
        ) : (
          <div className="expense-grid">
            {sortedExpenses.map((item) => (
              <ExpenseCard
                key={item.id}
                id={item.id}
                title={item.title}
                amount={item.amount}
                category={item.category}
                date={item.date}
                onDelete={onDeleteExpense}
                onEdit={handleEditExpense}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default DashboardPage;