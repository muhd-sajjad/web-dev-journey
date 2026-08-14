import type { Expense, SortBy } from "../types/expense.ts";
export function getCategoryOptions(expenses:Expense[] = []) {
  return [
    "all",
    ...new Set(
      expenses
        .map((item) => item.category?.trim())
        .filter(Boolean)
    )
  ];
}

export function filterExpenses(
  expenses:Expense[] = [],
  { category = "all", search = "" } = {}
) {
  const normalizedSearch = search.trim().toLowerCase();

  return expenses.filter((item) => {
    const categoryMatch =
      category === "all" ||
      item.category.toLowerCase() === category.toLowerCase();

    const searchMatch =
      normalizedSearch === "" ||
      item.title.toLowerCase().includes(normalizedSearch) ||
      item.category.toLowerCase().includes(normalizedSearch);

    return categoryMatch && searchMatch;
  });
}

export function sortExpenses(expenses:Expense[] = [], sortBy = "newest") {
  const copied = [...expenses];

  switch (sortBy) {
    case "oldest":
      return copied.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    case "amount-high":
      return copied.sort((a, b) => b.amount - a.amount);

    case "amount-low":
      return copied.sort((a, b) => a.amount - b.amount);

    case "title-az":
      return copied.sort((a, b) => a.title.localeCompare(b.title));

    case "title-za":
      return copied.sort((a, b) => b.title.localeCompare(a.title));

    case "newest":
    default:
      return copied.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }
}

export function getExpenseSummary(expenses:Expense[] = []) {
  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);
  const highExpenseCount = expenses.filter((item) => item.amount > 100).length;
  const totalCategories = new Set(expenses.map((item) => item.category)).size;

  return {
    totalAmount,
    highExpenseCount,
    totalCategories
  };
}