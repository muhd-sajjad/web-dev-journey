import type { Expense, ExpenseInput } from "../types/expense.ts";
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  TokenResponse
} from "../types/auth.ts";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");
const TOKEN_KEY = "trackly-token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// FastAPI returns `detail` as a string for HTTP errors and as a list of
// { msg, loc } objects for validation errors (422).
function extractMessage(data: unknown, status: number): string {
  const detail = (data as { detail?: unknown } | null)?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item as { msg?: unknown })?.msg)
      .filter((msg): msg is string => typeof msg === "string");

    if (messages.length > 0) {
      return messages.join(". ");
    }
  }

  return `Request failed (HTTP ${status})`;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function request<T>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(
      "Cannot reach the server. Check your connection and try again.",
      0
    );
  }

  if (!response.ok) {
    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      // response had no JSON body
    }

    throw new ApiError(extractMessage(data, response.status), response.status);
  }

  return (await response.json()) as T;
}

export function registerUser(data: RegisterInput): Promise<AuthUser> {
  return request<AuthUser>("/auth/register", {
    method: "POST",
    body: data,
    auth: false
  });
}

export function loginUser(data: LoginInput): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    body: data,
    auth: false
  });
}

export function fetchCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>("/auth/me");
}

export function fetchExpenses(): Promise<Expense[]> {
  return request<Expense[]>("/expenses");
}

export function createExpense(expense: ExpenseInput): Promise<Expense> {
  return request<Expense>("/expenses", { method: "POST", body: expense });
}

export function updateExpense(
  id: number,
  expense: ExpenseInput
): Promise<Expense> {
  return request<Expense>(`/expenses/${id}`, { method: "PUT", body: expense });
}

export async function deleteExpense(id: number): Promise<void> {
  await request<unknown>(`/expenses/${id}`, { method: "DELETE" });
}
