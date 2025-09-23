/**
 * Error handling utilities for Timbang Cerdas
 * Centralized error management and user-friendly error messages
 */

import { ErrorCode, ERROR_MESSAGES } from './constants';

export interface AppError {
  code: ErrorCode;
  message: string;
  originalError?: Error;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ErrorHandlerOptions {
  showToUser?: boolean;
  logToConsole?: boolean;
  logToFile?: boolean;
  context?: Record<string, any>;
}

export class ErrorHandler {
  private static logs: AppError[] = [];
  private static maxLogs = 1000;

  // Create standardized error object
  static createError(
    code: ErrorCode,
    message?: string,
    originalError?: Error,
    context?: Record<string, any>
  ): AppError {
    return {
      code,
      message: message || this.getDefaultMessage(code),
      originalError,
      timestamp: new Date(),
      context,
    };
  }

  // Get default message for error code
  static getDefaultMessage(code: ErrorCode): string {
    switch (code) {
      // Authentication errors
      case ErrorCode.INVALID_CREDENTIALS:
        return ERROR_MESSAGES.INVALID_CREDENTIALS;
      case ErrorCode.USER_NOT_FOUND:
        return 'User tidak ditemukan';
      case ErrorCode.USERNAME_TAKEN:
        return 'Username sudah digunakan';
      case ErrorCode.SESSION_EXPIRED:
        return 'Sesi telah berakhir, silakan login kembali';

      // Validation errors
      case ErrorCode.REQUIRED_FIELD:
        return ERROR_MESSAGES.REQUIRED_FIELD;
      case ErrorCode.INVALID_FORMAT:
        return 'Format input tidak valid';
      case ErrorCode.VALUE_TOO_LONG:
        return 'Nilai terlalu panjang';
      case ErrorCode.VALUE_TOO_SHORT:
        return 'Nilai terlalu pendek';
      case ErrorCode.INVALID_RANGE:
        return 'Nilai di luar rentang yang diperbolehkan';

      // Database errors
      case ErrorCode.DATABASE_ERROR:
        return ERROR_MESSAGES.DATABASE_ERROR;
      case ErrorCode.RECORD_NOT_FOUND:
        return 'Data tidak ditemukan';
      case ErrorCode.DUPLICATE_RECORD:
        return 'Data sudah ada';
      case ErrorCode.FOREIGN_KEY_CONSTRAINT:
        return 'Tidak dapat menghapus data yang masih digunakan';

      // Business logic errors
      case ErrorCode.INSUFFICIENT_STOCK:
        return 'Stok tidak mencukupi';
      case ErrorCode.INVALID_TRANSACTION:
        return 'Transaksi tidak valid';
      case ErrorCode.PRODUCT_NOT_FOUND:
        return 'Produk tidak ditemukan';
      case ErrorCode.INVALID_WEIGHT:
        return 'Berat tidak valid';

      // Hardware errors
      case ErrorCode.PRINTER_ERROR:
        return ERROR_MESSAGES.PRINTER_ERROR;
      case ErrorCode.SCALE_ERROR:
        return ERROR_MESSAGES.SCALE_ERROR;
      case ErrorCode.CONNECTION_ERROR:
        return 'Koneksi perangkat bermasalah';

      // System errors
      case ErrorCode.NETWORK_ERROR:
        return ERROR_MESSAGES.NETWORK_ERROR;
      case ErrorCode.PERMISSION_DENIED:
        return ERROR_MESSAGES.ACCESS_DENIED;
      case ErrorCode.FILE_NOT_FOUND:
        return 'File tidak ditemukan';
      case ErrorCode.UNKNOWN_ERROR:
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  // Handle error with various options
  static handle(
    error: Error | AppError | string,
    options: ErrorHandlerOptions = {}
  ): AppError {
    const {
      showToUser = true,
      logToConsole = true,
      logToFile = false,
      context = {},
    } = options;

    let appError: AppError;

    // Convert different error types to AppError
    if (typeof error === 'string') {
      appError = this.createError(ErrorCode.UNKNOWN_ERROR, error, undefined, context);
    } else if (error instanceof Error && !(error as any).code) {
      // Regular JavaScript Error
      appError = this.createError(
        ErrorCode.UNKNOWN_ERROR,
        error.message,
        error,
        context
      );
    } else if ((error as AppError).code) {
      // Already an AppError
      appError = error as AppError;
      if (context && Object.keys(context).length > 0) {
        appError.context = { ...appError.context, ...context };
      }
    } else {
      // Fallback
      appError = this.createError(
        ErrorCode.UNKNOWN_ERROR,
        'An unknown error occurred',
        error as Error,
        context
      );
    }

    // Log to console
    if (logToConsole) {
      console.error('Error handled:', {
        code: appError.code,
        message: appError.message,
        timestamp: appError.timestamp,
        context: appError.context,
        originalError: appError.originalError,
      });
    }

    // Log to memory (for debugging)
    this.addToLog(appError);

    // Log to file (future implementation)
    if (logToFile) {
      this.logToFile(appError);
    }

    return appError;
  }

  // Add error to in-memory log
  private static addToLog(error: AppError): void {
    this.logs.unshift(error);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  // Get error logs
  static getErrorLogs(): AppError[] {
    return [...this.logs];
  }

  // Clear error logs
  static clearErrorLogs(): void {
    this.logs = [];
  }

  // Log to file (placeholder for future implementation)
  private static logToFile(error: AppError): void {
    // TODO: Implement file logging
    // This could write to a log file in the device's document directory
    console.log('TODO: Implement file logging for error:', error);
  }

  // Handle async function with error catching
  static async handleAsync<T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<{ data?: T; error?: AppError }> {
    try {
      const data = await asyncFn();
      return { data };
    } catch (error) {
      const appError = this.handle(error as Error, options);
      return { error: appError };
    }
  }

  // Handle sync function with error catching
  static handleSync<T>(
    syncFn: () => T,
    options: ErrorHandlerOptions = {}
  ): { data?: T; error?: AppError } {
    try {
      const data = syncFn();
      return { data };
    } catch (error) {
      const appError = this.handle(error as Error, options);
      return { error: appError };
    }
  }

  // Check if error is of specific type
  static isErrorOfType(error: AppError, code: ErrorCode): boolean {
    return error.code === code;
  }

  // Check if error is authentication related
  static isAuthError(error: AppError): boolean {
    return [
      ErrorCode.INVALID_CREDENTIALS,
      ErrorCode.USER_NOT_FOUND,
      ErrorCode.USERNAME_TAKEN,
      ErrorCode.SESSION_EXPIRED,
    ].includes(error.code);
  }

  // Check if error is validation related
  static isValidationError(error: AppError): boolean {
    return [
      ErrorCode.REQUIRED_FIELD,
      ErrorCode.INVALID_FORMAT,
      ErrorCode.VALUE_TOO_LONG,
      ErrorCode.VALUE_TOO_SHORT,
      ErrorCode.INVALID_RANGE,
    ].includes(error.code);
  }

  // Check if error is database related
  static isDatabaseError(error: AppError): boolean {
    return [
      ErrorCode.DATABASE_ERROR,
      ErrorCode.RECORD_NOT_FOUND,
      ErrorCode.DUPLICATE_RECORD,
      ErrorCode.FOREIGN_KEY_CONSTRAINT,
    ].includes(error.code);
  }

  // Check if error is hardware related
  static isHardwareError(error: AppError): boolean {
    return [
      ErrorCode.PRINTER_ERROR,
      ErrorCode.SCALE_ERROR,
      ErrorCode.CONNECTION_ERROR,
    ].includes(error.code);
  }

  // Get user-friendly error message
  static getUserFriendlyMessage(error: AppError): string {
    // Return the error message, which should already be user-friendly
    return error.message;
  }

  // Get technical error details (for developers)
  static getTechnicalDetails(error: AppError): string {
    const details: string[] = [];
    
    details.push(`Code: ${error.code}`);
    details.push(`Message: ${error.message}`);
    details.push(`Timestamp: ${error.timestamp.toISOString()}`);
    
    if (error.originalError) {
      details.push(`Original Error: ${error.originalError.message}`);
      if (error.originalError.stack) {
        details.push(`Stack: ${error.originalError.stack}`);
      }
    }
    
    if (error.context && Object.keys(error.context).length > 0) {
      details.push(`Context: ${JSON.stringify(error.context, null, 2)}`);
    }
    
    return details.join('\n');
  }

  // Format error for display
  static formatForDisplay(error: AppError, includeCode: boolean = false): string {
    let message = error.message;
    
    if (includeCode) {
      message = `[${error.code}] ${message}`;
    }
    
    return message;
  }

  // Retry mechanism for operations that might fail temporarily
  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000,
    backoff: boolean = true
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw this.handle(lastError, {
            context: { attempt, maxAttempts }
          });
        }
        
        // Wait before retry
        const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        console.log(`Retry attempt ${attempt + 1}/${maxAttempts} after ${waitTime}ms`);
      }
    }
    
    throw this.handle(lastError!, {
      context: { maxAttempts, finalAttempt: true }
    });
  }

  // Create error from validation result
  static fromValidationResult(
    field: string,
    validationMessage: string,
    context?: Record<string, any>
  ): AppError {
    return this.createError(
      ErrorCode.INVALID_FORMAT,
      validationMessage,
      undefined,
      { field, ...context }
    );
  }

  // Create network error
  static createNetworkError(
    message?: string,
    originalError?: Error,
    context?: Record<string, any>
  ): AppError {
    return this.createError(
      ErrorCode.NETWORK_ERROR,
      message || ERROR_MESSAGES.NETWORK_ERROR,
      originalError,
      context
    );
  }

  // Create database error
  static createDatabaseError(
    message?: string,
    originalError?: Error,
    context?: Record<string, any>
  ): AppError {
    return this.createError(
      ErrorCode.DATABASE_ERROR,
      message || ERROR_MESSAGES.DATABASE_ERROR,
      originalError,
      context
    );
  }

  // Create validation error
  static createValidationError(
    field: string,
    message: string,
    context?: Record<string, any>
  ): AppError {
    return this.createError(
      ErrorCode.INVALID_FORMAT,
      message,
      undefined,
      { field, ...context }
    );
  }

  // Create authentication error
  static createAuthError(
    message?: string,
    context?: Record<string, any>
  ): AppError {
    return this.createError(
      ErrorCode.INVALID_CREDENTIALS,
      message || ERROR_MESSAGES.INVALID_CREDENTIALS,
      undefined,
      context
    );
  }

  // Get error statistics
  static getErrorStats(): {
    total: number;
    byCode: Record<string, number>;
    recent: number; // last hour
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const byCode: Record<string, number> = {};
    let recent = 0;
    
    this.logs.forEach(error => {
      // Count by code
      byCode[error.code] = (byCode[error.code] || 0) + 1;
      
      // Count recent errors
      if (error.timestamp >= oneHourAgo) {
        recent++;
      }
    });
    
    return {
      total: this.logs.length,
      byCode,
      recent,
    };
  }
}

// Helper functions for common error scenarios
export const handleAuthError = (error: Error, context?: Record<string, any>): AppError => {
  return ErrorHandler.handle(error, { context });
};

export const handleDatabaseError = (error: Error, context?: Record<string, any>): AppError => {
  return ErrorHandler.createDatabaseError(error.message, error, context);
};

export const handleValidationError = (field: string, message: string): AppError => {
  return ErrorHandler.createValidationError(field, message);
};

export const handleNetworkError = (error: Error, context?: Record<string, any>): AppError => {
  return ErrorHandler.createNetworkError(error.message, error, context);
};

// Async wrapper with error handling
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<{ data?: R; error?: AppError }> => {
    return ErrorHandler.handleAsync(() => fn(...args));
  };
};

// Sync wrapper with error handling
export const withSyncErrorHandling = <T extends any[], R>(
  fn: (...args: T) => R
) => {
  return (...args: T): { data?: R; error?: AppError } => {
    return ErrorHandler.handleSync(() => fn(...args));
  };
};

export default ErrorHandler;
