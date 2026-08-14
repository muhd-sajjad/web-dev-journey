  export interface Expense {
    id: number;
    title: string;
    amount: number;
    category: string;
    date: string;
  }

  export interface ExpenseFormErrors {
    title?: string;
    amount?: string;
    category?: string;
    date?: string;
  }

  export type SortBy =
    | "newest"
    | "oldest"
    | "amount-high"
    | "amount-low"
    | "title-az"
    | "title-za";

export type ExpenseInput = Omit<Expense, "id">;

export interface ExpenseFormErrors {
  title?: string;
  amount?: string;
  category?: string;
  date?: string;
}