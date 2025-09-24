/**
 * Application constants and configurations for Timbang Cerdas
 */

// App Information
export const APP_INFO = {
  NAME: 'Timbang Cerdas',
  VERSION: '1.0.0',
  DESCRIPTION: 'Smart Weighing Scale Application',
  DEVELOPER: '4SEKAWAN',
  COPYRIGHT: '© 2025 4SEKAWAN',
} as const;

// Database Configuration
export const DATABASE = {
  NAME: 'timbang_cerdas.db',
  VERSION: 1,
  TABLES: {
    USERS: 'users',
    PRODUCTS: 'products',
    TRANSACTIONS: 'transactions',
    TRANSACTION_ITEMS: 'transaction_items',
    SETTINGS: 'settings',
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_SESSION: 'user_session',
  THEME: 'theme_preference',
  LANGUAGE: 'language_preference',
  PRINTER_CONFIG: 'printer_config',
  SCALE_CONFIG: 'scale_config',
  LAST_BACKUP: 'last_backup_date',
  SETTINGS: 'app_settings',
} as const;

// Theme Configuration
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Language Configuration
export const LANGUAGES = {
  INDONESIAN: 'id',
  ENGLISH: 'en',
} as const;

// Colors (Design System)
export const COLORS = {
  // Primary Colors
  PRIMARY: '#2563EB',
  PRIMARY_DARK: '#1D4ED8',
  PRIMARY_LIGHT: '#3B82F6',
  
  // Secondary Colors
  SECONDARY: '#64748B',
  SECONDARY_DARK: '#475569',
  SECONDARY_LIGHT: '#94A3B8',
  
  // Status Colors
  SUCCESS: '#10B981',
  SUCCESS_DARK: '#059669',
  SUCCESS_LIGHT: '#34D399',
  
  WARNING: '#F59E0B',
  WARNING_DARK: '#D97706',
  WARNING_LIGHT: '#FBBF24',
  
  ERROR: '#EF4444',
  ERROR_DARK: '#DC2626',
  ERROR_LIGHT: '#F87171',
  
  INFO: '#06B6D4',
  INFO_DARK: '#0891B2',
  INFO_LIGHT: '#22D3EE',
  
  // Neutral Colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_50: '#F9FAFB',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_600: '#4B5563',
  GRAY_700: '#374151',
  GRAY_800: '#1F2937',
  GRAY_900: '#111827',
  
  // Background Colors
  BACKGROUND: '#FFFFFF',
  BACKGROUND_DARK: '#1F2937',
  BACKGROUND_SECONDARY: '#F9FAFB',
  BACKGROUND_SECONDARY_DARK: '#374151',
  
  // Text Colors
  TEXT_PRIMARY: '#111827',
  TEXT_PRIMARY_DARK: '#F9FAFB',
  TEXT_SECONDARY: '#6B7280',
  TEXT_SECONDARY_DARK: '#D1D5DB',
} as const;

// Font Sizes
export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  BASE: 16,
  LG: 18,
  XL: 20,
  '2XL': 24,
  '3XL': 30,
  '4XL': 36,
  '5XL': 48,
} as const;

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  '2XL': 48,
  '3XL': 64,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  NONE: 0,
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  FULL: 9999,
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Business Rules
export const BUSINESS_RULES = {
  // Minimum and maximum values
  MIN_PRICE: 1,
  MAX_PRICE: 999999999,
  MIN_WEIGHT: 0.001, // 1 gram
  MAX_WEIGHT: 9999, // 9999 kg
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 99999,
  
  // Text length limits
  MAX_PRODUCT_NAME_LENGTH: 100,
  MAX_PRODUCT_CODE_LENGTH: 50,
  MAX_COMPANY_NAME_LENGTH: 100,
  MAX_ADDRESS_LENGTH: 255,
  MAX_USERNAME_LENGTH: 30,
  MAX_FULL_NAME_LENGTH: 100,
  
  MIN_USERNAME_LENGTH: 3,
  MIN_PASSWORD_LENGTH: 6,
  MIN_FULL_NAME_LENGTH: 2,
  MIN_COMPANY_NAME_LENGTH: 2,
  MIN_ADDRESS_LENGTH: 5,
  
  // Other limits
  MAX_RECEIPT_ITEMS: 100,
  MAX_BACKUP_FILES: 10,
  PASSWORD_HASH_ROUNDS: 10,
} as const;

// Receipt Configuration
export const RECEIPT_CONFIG = {
  DEFAULT_WIDTH: 80, // mm
  DEFAULT_FONT_SIZE: 12,
  LINE_SPACING: 1.2,
  MARGIN: 5, // mm
  
  SECTIONS: {
    HEADER: 'header',
    BODY: 'body',
    FOOTER: 'footer',
  },
  
  ALIGNMENT: {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right',
  },
  
  FONT_STYLES: {
    NORMAL: 'normal',
    BOLD: 'bold',
    ITALIC: 'italic',
  },
} as const;

// Printer Configuration
export const PRINTER_CONFIG = {
  CONNECTION_TYPES: {
    BLUETOOTH: 'bluetooth',
    USB: 'usb',
    NETWORK: 'network',
  },
  
  PAPER_SIZES: {
    WIDTH_58MM: 58,
    WIDTH_80MM: 80,
  },
  
  DEFAULT_SETTINGS: {
    PAPER_SIZE: 80,
    FONT_SIZE: 12,
    LINE_SPACING: 1.2,
    CUT_PAPER: true,
    OPEN_DRAWER: false,
  },
} as const;

// Scale Configuration
export const SCALE_CONFIG = {
  CONNECTION_TYPES: {
    BLUETOOTH: 'bluetooth',
    USB: 'usb',
    SERIAL: 'serial',
  },
  
  WEIGHT_UNITS: {
    GRAM: 'g',
    KILOGRAM: 'kg',
  },
  
  PRECISION: {
    GRAM: 0,
    KILOGRAM: 3,
  },
  
  DEFAULT_SETTINGS: {
    UNIT: 'kg',
    PRECISION: 3,
    AUTO_ZERO: true,
    STABLE_TIME: 2000, // ms
  },
} as const;

// Transaction Types
export enum TransactionType {
  SALE = 'sale',
  REFUND = 'refund',
  VOID = 'void',
}

// Payment Methods
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  DIGITAL_WALLET = 'digital_wallet',
  BANK_TRANSFER = 'bank_transfer',
  OTHER = 'other',
}

// Transaction Status
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// User Roles
export enum UserRole {
  ADMIN = 'admin',
  CASHIER = 'cashier',
  MANAGER = 'manager',
}

// Product Categories (can be extended)
export enum ProductCategory {
  FOOD = 'food',
  BEVERAGE = 'beverage',
  GROCERY = 'grocery',
  MEAT = 'meat',
  SEAFOOD = 'seafood',
  VEGETABLE = 'vegetable',
  FRUIT = 'fruit',
  DAIRY = 'dairy',
  BAKERY = 'bakery',
  OTHER = 'other',
}

// Weight Units
export enum WeightUnit {
  GRAM = 'g',
  KILOGRAM = 'kg',
  POUND = 'lb',
  OUNCE = 'oz',
}

// Currency
export const CURRENCY = {
  CODE: 'IDR',
  SYMBOL: 'Rp',
  NAME: 'Indonesian Rupiah',
  DECIMAL_PLACES: 0,
  THOUSAND_SEPARATOR: '.',
  DECIMAL_SEPARATOR: ',',
} as const;

// Date & Time Formats
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  MEDIUM: 'dd MMM yyyy',
  LONG: 'dd MMMM yyyy',
  FULL: 'EEEE, dd MMMM yyyy',
  ISO: 'yyyy-MM-dd',
  TIME_12: 'hh:mm a',
  TIME_24: 'HH:mm',
  DATETIME: 'dd/MM/yyyy HH:mm',
} as const;

// API Configuration (if needed for future integrations)
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// File Extensions
export const FILE_EXTENSIONS = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
  SPREADSHEETS: ['.xls', '.xlsx', '.csv'],
  BACKUP: ['.db', '.sqlite', '.json'],
} as const;

// Error Codes
export enum ErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation errors
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  VALUE_TOO_LONG = 'VALUE_TOO_LONG',
  VALUE_TOO_SHORT = 'VALUE_TOO_SHORT',
  INVALID_RANGE = 'INVALID_RANGE',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',
  FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',
  
  // Business logic errors
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INVALID_TRANSACTION = 'INVALID_TRANSACTION',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INVALID_WEIGHT = 'INVALID_WEIGHT',
  
  // Hardware errors
  PRINTER_ERROR = 'PRINTER_ERROR',
  SCALE_ERROR = 'SCALE_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // System errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
}

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login berhasil',
  LOGOUT_SUCCESS: 'Logout berhasil',
  REGISTER_SUCCESS: 'Registrasi berhasil',
  SAVE_SUCCESS: 'Data berhasil disimpan',
  UPDATE_SUCCESS: 'Data berhasil diperbarui',
  DELETE_SUCCESS: 'Data berhasil dihapus',
  TRANSACTION_SUCCESS: 'Transaksi berhasil',
  PRINT_SUCCESS: 'Cetak berhasil',
  BACKUP_SUCCESS: 'Backup berhasil dibuat',
  RESTORE_SUCCESS: 'Data berhasil dipulihkan',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Koneksi jaringan bermasalah',
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
  INVALID_INPUT: 'Input tidak valid',
  REQUIRED_FIELD: 'Field ini wajib diisi',
  INVALID_CREDENTIALS: 'Username atau password salah',
  ACCESS_DENIED: 'Akses ditolak',
  SERVER_ERROR: 'Terjadi kesalahan pada server',
  DATABASE_ERROR: 'Terjadi kesalahan pada database',
  PRINTER_ERROR: 'Terjadi kesalahan pada printer',
  SCALE_ERROR: 'Terjadi kesalahan pada timbangan',
} as const;

// Validation Patterns (RegEx)
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_ID: /^(\+62|62|0)[0-9]{8,13}$/,
  USERNAME: /^[a-zA-Z0-9_]+$/,
  PRODUCT_CODE: /^[a-zA-Z0-9_-]+$/,
  NUMERIC: /^[0-9]+$/,
  DECIMAL: /^[0-9]+(\.[0-9]+)?$/,
  ALPHA: /^[a-zA-Z]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
} as const;

// Default Settings
export const DEFAULT_SETTINGS = {
  company_name: 'Toko Saya',
  company_address: 'Jl. Contoh No. 123',
  company_phone: '021-12345678',
  receipt_header: 'STRUK BELANJA',
  receipt_footer: 'Terima kasih atas kunjungan Anda',
  currency_symbol: 'Rp',
  tax_rate: 0,
  auto_print: false,
  sound_enabled: true,
  theme: 'light',
  language: 'id',
} as const;

// Feature Flags (for enabling/disabling features)
export const FEATURE_FLAGS = {
  BLUETOOTH_PRINTER: true,
  BLUETOOTH_SCALE: true,
  BARCODE_SCANNER: true,
  RECEIPT_PREVIEW: true,
  DATA_EXPORT: true,
  DATA_IMPORT: true,
  BACKUP_RESTORE: true,
  MULTI_USER: false, // For future use
  INVENTORY_TRACKING: false, // For future use
  LOYALTY_PROGRAM: false, // For future use
} as const;

// Keyboard Shortcuts (for future desktop version)
export const KEYBOARD_SHORTCUTS = {
  NEW_TRANSACTION: 'Ctrl+N',
  SAVE: 'Ctrl+S',
  PRINT: 'Ctrl+P',
  SEARCH: 'Ctrl+F',
  SETTINGS: 'Ctrl+,',
  QUIT: 'Ctrl+Q',
} as const;

export default {
  APP_INFO,
  DATABASE,
  STORAGE_KEYS,
  THEMES,
  LANGUAGES,
  COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  ANIMATION_DURATION,
  BUSINESS_RULES,
  RECEIPT_CONFIG,
  PRINTER_CONFIG,
  SCALE_CONFIG,
  CURRENCY,
  DATE_FORMATS,
  API_CONFIG,
  FILE_EXTENSIONS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  VALIDATION_PATTERNS,
  DEFAULT_SETTINGS,
  FEATURE_FLAGS,
  KEYBOARD_SHORTCUTS,
  TransactionType,
  PaymentMethod,
  TransactionStatus,
  UserRole,
  ProductCategory,
  WeightUnit,
  ErrorCode,
};
