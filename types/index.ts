export type ColorTag = 'red' | 'yellow' | 'green' | 'blue' | 'purple';
export type IncomeStatus = 'Pagado' | 'Pendiente' | 'Parcial';
export type ExpenseCategory =
  | 'Servicios'
  | 'Equipamiento'
  | 'Software'
  | 'Impuestos'
  | 'Marketing'
  | 'Varios';
export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Débito' | 'Crédito';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Column {
  id: string;
  user_id: string;
  name: string;
  position: number;
  color?: string;
  created_at: string;
}

export interface PriorityLabel {
  id: string;
  column_id: string;
  user_id: string;
  text: string;
  bg_color: string;
  position: number;
}

export interface Task {
  id: string;
  user_id: string;
  column_id: string;
  title: string;
  description?: string;
  client_id?: string;
  client_name?: string;
  amount?: number;
  due_date?: string;
  color_tag?: ColorTag;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
}

export interface ClientDetail extends Client {
  tasks: Task[];
  income: Income[];
  total_billed: number;
  project_count: number;
}

export interface Income {
  id: string;
  user_id: string;
  client_id?: string;
  task_id?: string;
  description: string;
  amount: number;
  date: string;
  status: IncomeStatus;
  created_at: string;
  client?: Client;
}

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  created_at: string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  bank: string;
  closing_day: number;
  due_day: number;
  created_at: string;
  purchases?: CardPurchase[];
  total_month?: number;
  next_due_amount?: number;
  days_until_due?: number;
}

export interface CardPurchase {
  id: string;
  user_id: string;
  card_id: string;
  merchant: string;
  amount: number;
  installments: number;
  date: string;
  created_at: string;
}

export interface MonthlyTotals {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  pendingCobros: number;
}

export interface MonthlyBarData {
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryTotal {
  category: ExpenseCategory;
  total: number;
}
