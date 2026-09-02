import type { Expense } from "../types/expense.ts";

export interface CategoryChartItem {
  name: string;
  value: number;
}

export interface DateChartItem {
  date: string;
  amount: number;
}

export function getCategoryChartData(expenses: Expense[]): CategoryChartItem[] {
  const grouped = expenses.reduce<Record<string, number>>((acc, expense) => {
    const category = expense.category || "Other";
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getDateChartData(expenses: Expense[]): DateChartItem[] {
  const grouped = expenses.reduce<Record<string, number>>((acc, expense) => {
    const date = expense.date;
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}