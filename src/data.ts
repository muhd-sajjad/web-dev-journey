import type { Expense } from "./types/expense.ts";
export const initialExpenses: Expense[] = [
  {
    id: 1,
    title: "Snacks",
    amount: 120,
    category: "Food",
    date: "2026-07-09"
  },
  {
    id: 2,
    title: "Travel",
    amount: 80,
    category: "Transport",
    date: "2026-07-08"
  },
  {
    id: 3,
    title: "Internet",
    amount: 50,
    category: "Bills",
    date: "2026-07-07"
  },
  {
    id: 4,
    title: "Shopping",
    amount: 300,
    category: "Lifestyle",
    date: "2026-07-06"
  },
  {
  id: 5,
  title: "Movie",
  amount: 250,
  category: "Entertainment",
  date: "2026-06-26"
}
];