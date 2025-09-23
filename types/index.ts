// Core Database Entities
export interface User {
  id?: number;
  username: string;
  password?: string; // Only for forms, not returned from DB
  full_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id?: number;
  user_id: number;
  transaction_date: string;
  
  // Data Barang
  jenis_barang: string;
  
  // Data Timbangan
  bruto_kg: number;
  tare_kg: number;
  netto_kg: number;
  
  // Data Harga
  pot_percentage?: number;
  pot_kg?: number;
  harga_per_kg: number;
  total_kg: number;
  total_harga: number;
  
  // Data Admin & Customer
  admin_name: string;
  customer_name: string;
  
  // Alamat & Kontak
  alamat?: string;
  phone?: string;
  
  // Catatan
  catatan?: string;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
}

export interface CompanySettings {
  id?: number;
  user_id: number;
  
  // Header Information
  company_name: string;
  company_address: string;
  company_phone: string;
  company_phone_label: string;
  
  // Footer Information
  footer_text: string;
  show_admin: boolean;
  show_customer: boolean;
  show_notes: boolean;
  
  // Receipt Layout
  paper_width: number;
  font_size_header: number;
  font_size_body: number;
  font_size_footer: number;
  
  // Separator Lines
  use_separator_lines: boolean;
  separator_char: string;
  
  // Date Format
  date_format: string;
  show_time: boolean;
  
  // Number Format
  decimal_places: number;
  thousand_separator: string;
  decimal_separator: string;
  currency_symbol: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface AppSetting {
  id?: number;
  user_id?: number;
  setting_key: string;
  setting_value: string;
  created_at?: string;
  updated_at?: string;
}

// Form Types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  full_name: string;
}

export interface TransactionFormData {
  jenis_barang: string;
  bruto_kg: string;
  tare_kg: string;
  netto_kg: string;
  pot_percentage: string;
  pot_kg: string;
  harga_per_kg: string;
  total_kg: string;
  total_harga: string;
  admin_name: string;
  customer_name: string;
  alamat: string;
  phone: string;
  catatan: string;
}

// Helper Types
export type TransactionFormField = keyof TransactionFormData;

export interface UserSession {
  id: number;
  username: string;
  full_name: string;
  isAuthenticated: boolean;
}

// Navigation Types
export interface TabBarIcon {
  focused: boolean;
  color: string;
  size: number;
}

// Database Query Results
export interface TransactionWithCompanySettings extends Transaction {
  // Company settings fields for receipt generation
  company_name: string;
  company_address: string;
  company_phone: string;
  company_phone_label: string;
  footer_text: string;
  currency_symbol: string;
  decimal_places: number;
  thousand_separator: string;
  decimal_separator: string;
  date_format: string;
}

// Search and Filter Types
export interface TransactionFilter {
  customer_name?: string;
  jenis_barang?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// Stats and Dashboard Types
export interface DashboardStats {
  total_transactions: number;
  total_revenue: number;
  today_transactions: number;
  today_revenue: number;
  recent_transactions: Transaction[];
}

// Receipt/Printing Types
export interface ReceiptData {
  transaction: Transaction;
  company: CompanySettings;
  formatted_date: string;
  formatted_price: string;
  formatted_total: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination Types
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Theme and UI Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
}
