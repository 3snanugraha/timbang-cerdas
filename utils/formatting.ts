/**
 * Formatting utilities for Timbang Cerdas
 * Contains helper functions for currency, date, number formatting
 */

export class FormattingUtils {
  // Currency formatting (Indonesian Rupiah)
  static formatCurrency(amount: number | string, withSymbol: boolean = true): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return withSymbol ? 'Rp 0' : '0';

    const formatted = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(numAmount));

    const prefix = withSymbol ? 'Rp ' : '';
    const sign = numAmount < 0 ? '-' : '';

    return `${sign}${prefix}${formatted}`;
  }

  // Currency formatting with decimal places
  static formatCurrencyWithDecimals(amount: number | string, decimals: number = 2, withSymbol: boolean = true): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return withSymbol ? 'Rp 0.00' : '0.00';

    const formatted = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(Math.abs(numAmount));

    const prefix = withSymbol ? 'Rp ' : '';
    const sign = numAmount < 0 ? '-' : '';

    return `${sign}${prefix}${formatted}`;
  }

  // Parse currency string to number
  static parseCurrency(currencyString: string): number {
    if (!currencyString) return 0;
    
    // Remove Rp, spaces, dots (thousand separators), and other non-digit chars except comma
    const cleaned = currencyString
      .replace(/[Rp\s.]/g, '')
      .replace(',', '.');
    
    return parseFloat(cleaned) || 0;
  }

  // Number formatting with thousand separators
  static formatNumber(number: number | string, decimals: number = 0): string {
    const num = typeof number === 'string' ? parseFloat(number) : number;
    
    if (isNaN(num)) return '0';

    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  // Weight formatting (kg/gram)
  static formatWeight(weight: number | string, unit: 'kg' | 'g' = 'kg'): string {
    const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
    
    if (isNaN(numWeight)) return `0 ${unit}`;

    const formatted = this.formatNumber(numWeight, unit === 'kg' ? 2 : 0);
    return `${formatted} ${unit}`;
  }

  // Parse weight string to number
  static parseWeight(weightString: string): number {
    if (!weightString) return 0;
    
    // Remove kg, g, spaces and other non-digit chars except comma/dot
    const cleaned = weightString
      .replace(/[kg\s]/gi, '')
      .replace(',', '.');
    
    return parseFloat(cleaned) || 0;
  }

  // Date formatting (Indonesian locale)
  static formatDate(date: Date | string, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Tanggal tidak valid';

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Jakarta',
    };

    switch (format) {
      case 'short':
        options.day = '2-digit';
        options.month = '2-digit';
        options.year = 'numeric';
        break;
      case 'medium':
        options.day = 'numeric';
        options.month = 'short';
        options.year = 'numeric';
        break;
      case 'long':
        options.day = 'numeric';
        options.month = 'long';
        options.year = 'numeric';
        break;
      case 'full':
        options.weekday = 'long';
        options.day = 'numeric';
        options.month = 'long';
        options.year = 'numeric';
        break;
    }

    return new Intl.DateTimeFormat('id-ID', options).format(dateObj);
  }

  // Time formatting
  static formatTime(date: Date | string, includeSeconds: boolean = false): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Waktu tidak valid';

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24-hour format
    };

    if (includeSeconds) {
      options.second = '2-digit';
    }

    return new Intl.DateTimeFormat('id-ID', options).format(dateObj);
  }

  // DateTime formatting
  static formatDateTime(date: Date | string, dateFormat: 'short' | 'medium' | 'long' = 'medium', includeSeconds: boolean = false): string {
    const formattedDate = this.formatDate(date, dateFormat);
    const formattedTime = this.formatTime(date, includeSeconds);
    
    return `${formattedDate} ${formattedTime}`;
  }

  // Relative time formatting (e.g., "2 jam yang lalu")
  static formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    
    if (isNaN(dateObj.getTime())) return 'Waktu tidak valid';

    // Convert to seconds, minutes, hours, days
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) {
      return 'Baru saja';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} menit yang lalu`;
    } else if (diffHours < 24) {
      return `${diffHours} jam yang lalu`;
    } else if (diffDays < 30) {
      return `${diffDays} hari yang lalu`;
    } else if (diffMonths < 12) {
      return `${diffMonths} bulan yang lalu`;
    } else {
      return `${diffYears} tahun yang lalu`;
    }
  }

  // Format date for input fields (YYYY-MM-DD)
  static formatDateForInput(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Format time for input fields (HH:MM)
  static formatTimeForInput(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';

    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  // Format percentage
  static formatPercentage(value: number | string, decimals: number = 1): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(num)) return '0%';

    return `${this.formatNumber(num, decimals)}%`;
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);

    return `${this.formatNumber(size, i === 0 ? 0 : 1)} ${sizes[i]}`;
  }

  // Capitalize first letter of each word
  static capitalizeWords(text: string): string {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Capitalize first letter only
  static capitalizeFirst(text: string): string {
    if (!text) return '';
    
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  // Format phone number for display
  static formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Indonesian mobile number format: 0812-3456-7890
    if (cleaned.startsWith('08') && cleaned.length >= 10) {
      return cleaned.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
    }
    // Indonesian landline format: 021-1234-5678
    else if (cleaned.startsWith('0') && cleaned.length >= 8) {
      return cleaned.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
    }
    
    return phone; // Return original if can't format
  }

  // Truncate text with ellipsis
  static truncateText(text: string, maxLength: number, ellipsis: string = '...'): string {
    if (!text) return '';
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - ellipsis.length) + ellipsis;
  }

  // Format duration in minutes to hours:minutes
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} menit`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} jam`;
    }

    return `${hours} jam ${remainingMinutes} menit`;
  }

  // Format transaction ID with prefix
  static formatTransactionId(id: number | string, prefix: string = 'TXN'): string {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(numId)) return `${prefix}-0000`;
    
    const paddedId = String(numId).padStart(6, '0');
    return `${prefix}-${paddedId}`;
  }

  // Format receipt number
  static formatReceiptNumber(id: number | string, date?: Date): string {
    const dateObj = date || new Date();
    const year = dateObj.getFullYear().toString().slice(-2);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    const paddedId = String(numId || 0).padStart(4, '0');
    return `${year}${month}${paddedId}`;
  }

  // Format product code/SKU
  static formatProductCode(code: string, prefix?: string): string {
    if (!code) return '';
    
    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9-_]/g, '');
    
    if (prefix) {
      return `${prefix}-${cleanCode}`;
    }
    
    return cleanCode;
  }

  // Format address for display (multiline to single line)
  static formatAddressOneLine(address: string): string {
    if (!address) return '';
    
    return address
      .replace(/\n/g, ', ')
      .replace(/,\s*,/g, ',') // Remove double commas
      .replace(/^\s*,|,\s*$/g, '') // Remove leading/trailing commas
      .trim();
  }

  // Format numbers with ordinal suffix (1st, 2nd, 3rd, etc.)
  static formatOrdinal(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const mod100 = num % 100;
    
    if (mod100 >= 11 && mod100 <= 13) {
      return `${num}th`;
    }
    
    const mod10 = num % 10;
    const suffix = suffixes[mod10] || suffixes[0];
    
    return `${num}${suffix}`;
  }

  // Remove formatting from currency string
  static cleanCurrencyString(value: string): string {
    if (!value) return '0';
    
    return value
      .replace(/[Rp\s]/g, '')
      .replace(/\./g, '') // Remove thousand separators
      .replace(',', '.'); // Convert decimal comma to dot
  }

  // Format large numbers with K, M, B suffixes
  static formatLargeNumber(num: number, decimals: number = 1): string {
    if (num < 1000) return this.formatNumber(num, 0);
    
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const tier = Math.log10(Math.abs(num)) / 3 | 0;
    
    if (tier === 0) return this.formatNumber(num, 0);
    
    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;
    
    return `${this.formatNumber(scaled, decimals)}${suffix}`;
  }

  // Format barcode/QR code
  static formatBarcode(code: string): string {
    if (!code) return '';
    
    // Remove spaces and convert to uppercase
    return code.replace(/\s/g, '').toUpperCase();
  }

  // Format measurement units
  static formatMeasurement(value: number, unit: string, decimals: number = 2): string {
    if (isNaN(value)) return `0 ${unit}`;
    
    return `${this.formatNumber(value, decimals)} ${unit}`;
  }
}

// Helper functions for common formatting tasks
export const formatRupiah = (amount: number | string, withSymbol: boolean = true): string => {
  return FormattingUtils.formatCurrency(amount, withSymbol);
};

export const formatDate = (date: Date | string, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string => {
  return FormattingUtils.formatDate(date, format);
};

export const formatTime = (date: Date | string, includeSeconds: boolean = false): string => {
  return FormattingUtils.formatTime(date, includeSeconds);
};

export const formatDateTime = (date: Date | string, dateFormat: 'short' | 'medium' | 'long' = 'medium', includeSeconds: boolean = false): string => {
  return FormattingUtils.formatDateTime(date, dateFormat, includeSeconds);
};

export const formatNumber = (number: number | string, decimals: number = 0): string => {
  return FormattingUtils.formatNumber(number, decimals);
};

export const formatWeight = (weight: number | string, unit: 'kg' | 'g' = 'kg'): string => {
  return FormattingUtils.formatWeight(weight, unit);
};

export const formatPhone = (phone: string): string => {
  return FormattingUtils.formatPhoneNumber(phone);
};

export const capitalizeWords = (text: string): string => {
  return FormattingUtils.capitalizeWords(text);
};

export const truncateText = (text: string, maxLength: number, ellipsis: string = '...'): string => {
  return FormattingUtils.truncateText(text, maxLength, ellipsis);
};

export default FormattingUtils;
