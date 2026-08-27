import type { Expense, ExpenseInput } from "../types/expense.ts";
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  TokenResponse
} from "../types/auth.ts";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const TOKEN_KEY = "trackly-token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(includeJson = false): HeadersInit {
  const token = getToken();

  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `HTTP error: ${response.status}`;

    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        message = errorData.detail;
      }
    } catch {
      //
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function registerUser(data: RegisterInput): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return handleResponse<AuthUser>(response);
}

export async function loginUser(data: LoginInput): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return handleResponse<TokenResponse>(response);
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  });

  return handleResponse<AuthUser>(response);
}

export async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    headers: getAuthHeaders()
  });

  return handleResponse<Expense[]>(response);
}

export async function createExpense(expense: ExpenseInput): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(expense)
  });

  return handleResponse<Expense>(response);
}

export async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    let message = `HTTP error: ${response.status}`;

    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        message = errorData.detail;
      }
    } catch {
      //
    }

    throw new Error(message);
  }
}