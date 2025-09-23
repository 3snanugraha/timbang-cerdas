/**
 * Validation utilities for Timbang Cerdas
 * Contains helper functions for input validation
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export class ValidationUtils {
  // Email validation
  static validateEmail(email: string): ValidationResult {
    if (!email || !email.trim()) {
      return { isValid: false, message: 'Email harus diisi' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, message: 'Format email tidak valid' };
    }

    return { isValid: true };
  }

  // Phone number validation (Indonesian format)
  static validatePhoneNumber(phone: string): ValidationResult {
    if (!phone || !phone.trim()) {
      return { isValid: false, message: 'Nomor telepon harus diisi' };
    }

    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Indonesian phone number patterns
    // Mobile: 08xx-xxxx-xxxx (starts with 08, 10-13 digits)
    // Landline: 021-xxxx-xxxx, 022-xxxx-xxxx, etc. (area code + number)
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return { isValid: false, message: 'Nomor telepon harus 8-15 digit' };
    }

    // Check Indonesian mobile number pattern (starts with 08)
    if (cleanPhone.startsWith('08')) {
      if (cleanPhone.length < 10 || cleanPhone.length > 13) {
        return { isValid: false, message: 'Nomor HP harus 10-13 digit' };
      }
    }
    // Check Indonesian international format (+62)
    else if (cleanPhone.startsWith('62')) {
      if (cleanPhone.length < 11 || cleanPhone.length > 15) {
        return { isValid: false, message: 'Nomor telepon internasional tidak valid' };
      }
    }
    // Check other landline patterns (area codes)
    else if (!cleanPhone.match(/^0[1-9]/)) {
      return { isValid: false, message: 'Nomor telepon harus dimulai dengan 0 atau +62' };
    }

    return { isValid: true };
  }

  // Username validation
  static validateUsername(username: string): ValidationResult {
    if (!username || !username.trim()) {
      return { isValid: false, message: 'Username harus diisi' };
    }

    if (username.length < 3) {
      return { isValid: false, message: 'Username minimal 3 karakter' };
    }

    if (username.length > 30) {
      return { isValid: false, message: 'Username maksimal 30 karakter' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { isValid: false, message: 'Username hanya boleh mengandung huruf, angka, dan underscore' };
    }

    if (username.startsWith('_') || username.endsWith('_')) {
      return { isValid: false, message: 'Username tidak boleh dimulai atau diakhiri dengan underscore' };
    }

    return { isValid: true };
  }

  // Password validation
  static validatePassword(password: string): ValidationResult {
    if (!password || !password.trim()) {
      return { isValid: false, message: 'Password harus diisi' };
    }

    if (password.length < 6) {
      return { isValid: false, message: 'Password minimal 6 karakter' };
    }

    if (password.length > 128) {
      return { isValid: false, message: 'Password maksimal 128 karakter' };
    }

    // Check for at least one letter and one number (optional stronger validation)
    // if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    //   return { isValid: false, message: 'Password harus mengandung huruf dan angka' };
    // }

    return { isValid: true };
  }

  // Confirm password validation
  static validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
    if (!confirmPassword || !confirmPassword.trim()) {
      return { isValid: false, message: 'Konfirmasi password harus diisi' };
    }

    if (password !== confirmPassword) {
      return { isValid: false, message: 'Konfirmasi password tidak sesuai' };
    }

    return { isValid: true };
  }

  // Full name validation
  static validateFullName(fullName: string): ValidationResult {
    if (!fullName || !fullName.trim()) {
      return { isValid: false, message: 'Nama lengkap harus diisi' };
    }

    if (fullName.trim().length < 2) {
      return { isValid: false, message: 'Nama lengkap minimal 2 karakter' };
    }

    if (fullName.trim().length > 100) {
      return { isValid: false, message: 'Nama lengkap maksimal 100 karakter' };
    }

    // Allow letters, spaces, dots, apostrophes, hyphens
    if (!/^[a-zA-Z\s.'-]+$/.test(fullName.trim())) {
      return { isValid: false, message: 'Nama lengkap hanya boleh mengandung huruf, spasi, titik, apostrof, dan tanda hubung' };
    }

    return { isValid: true };
  }

  // Company name validation
  static validateCompanyName(companyName: string): ValidationResult {
    if (!companyName || !companyName.trim()) {
      return { isValid: false, message: 'Nama perusahaan harus diisi' };
    }

    if (companyName.trim().length < 2) {
      return { isValid: false, message: 'Nama perusahaan minimal 2 karakter' };
    }

    if (companyName.trim().length > 100) {
      return { isValid: false, message: 'Nama perusahaan maksimal 100 karakter' };
    }

    return { isValid: true };
  }

  // Address validation
  static validateAddress(address: string): ValidationResult {
    if (!address || !address.trim()) {
      return { isValid: false, message: 'Alamat harus diisi' };
    }

    if (address.trim().length < 5) {
      return { isValid: false, message: 'Alamat minimal 5 karakter' };
    }

    if (address.trim().length > 255) {
      return { isValid: false, message: 'Alamat maksimal 255 karakter' };
    }

    return { isValid: true };
  }

  // Price validation
  static validatePrice(price: string | number): ValidationResult {
    let numPrice: number;

    if (typeof price === 'string') {
      // Remove currency symbols and whitespace
      const cleanPrice = price.replace(/[Rp.,\s]/g, '');
      
      if (!cleanPrice) {
        return { isValid: false, message: 'Harga harus diisi' };
      }

      numPrice = parseFloat(cleanPrice);
    } else {
      numPrice = price;
    }

    if (isNaN(numPrice)) {
      return { isValid: false, message: 'Harga harus berupa angka' };
    }

    if (numPrice < 0) {
      return { isValid: false, message: 'Harga tidak boleh negatif' };
    }

    if (numPrice > 999999999) {
      return { isValid: false, message: 'Harga maksimal Rp 999.999.999' };
    }

    return { isValid: true };
  }

  // Weight validation
  static validateWeight(weight: string | number): ValidationResult {
    let numWeight: number;

    if (typeof weight === 'string') {
      // Remove kg/gram units and whitespace
      const cleanWeight = weight.replace(/[kg\s]/gi, '');
      
      if (!cleanWeight) {
        return { isValid: false, message: 'Berat harus diisi' };
      }

      numWeight = parseFloat(cleanWeight);
    } else {
      numWeight = weight;
    }

    if (isNaN(numWeight)) {
      return { isValid: false, message: 'Berat harus berupa angka' };
    }

    if (numWeight <= 0) {
      return { isValid: false, message: 'Berat harus lebih dari 0' };
    }

    if (numWeight > 9999) {
      return { isValid: false, message: 'Berat maksimal 9999 kg' };
    }

    return { isValid: true };
  }

  // Quantity validation
  static validateQuantity(quantity: string | number): ValidationResult {
    let numQuantity: number;

    if (typeof quantity === 'string') {
      const cleanQuantity = quantity.trim();
      
      if (!cleanQuantity) {
        return { isValid: false, message: 'Jumlah harus diisi' };
      }

      numQuantity = parseInt(cleanQuantity, 10);
    } else {
      numQuantity = quantity;
    }

    if (isNaN(numQuantity)) {
      return { isValid: false, message: 'Jumlah harus berupa angka' };
    }

    if (numQuantity <= 0) {
      return { isValid: false, message: 'Jumlah harus lebih dari 0' };
    }

    if (numQuantity > 99999) {
      return { isValid: false, message: 'Jumlah maksimal 99999' };
    }

    if (!Number.isInteger(numQuantity)) {
      return { isValid: false, message: 'Jumlah harus bilangan bulat' };
    }

    return { isValid: true };
  }

  // Product name validation
  static validateProductName(productName: string): ValidationResult {
    if (!productName || !productName.trim()) {
      return { isValid: false, message: 'Nama produk harus diisi' };
    }

    if (productName.trim().length < 2) {
      return { isValid: false, message: 'Nama produk minimal 2 karakter' };
    }

    if (productName.trim().length > 100) {
      return { isValid: false, message: 'Nama produk maksimal 100 karakter' };
    }

    return { isValid: true };
  }

  // Product code/SKU validation
  static validateProductCode(productCode: string): ValidationResult {
    if (!productCode || !productCode.trim()) {
      return { isValid: false, message: 'Kode produk harus diisi' };
    }

    if (productCode.trim().length < 2) {
      return { isValid: false, message: 'Kode produk minimal 2 karakter' };
    }

    if (productCode.trim().length > 50) {
      return { isValid: false, message: 'Kode produk maksimal 50 karakter' };
    }

    // Allow letters, numbers, hyphens, underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(productCode.trim())) {
      return { isValid: false, message: 'Kode produk hanya boleh mengandung huruf, angka, underscore, dan tanda hubung' };
    }

    return { isValid: true };
  }

  // Required field validation
  static validateRequired(value: string, fieldName: string): ValidationResult {
    if (!value || !value.trim()) {
      return { isValid: false, message: `${fieldName} harus diisi` };
    }

    return { isValid: true };
  }

  // Minimum length validation
  static validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
    if (!value) {
      return { isValid: false, message: `${fieldName} harus diisi` };
    }

    if (value.length < minLength) {
      return { isValid: false, message: `${fieldName} minimal ${minLength} karakter` };
    }

    return { isValid: true };
  }

  // Maximum length validation
  static validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
    if (value && value.length > maxLength) {
      return { isValid: false, message: `${fieldName} maksimal ${maxLength} karakter` };
    }

    return { isValid: true };
  }

  // Numeric validation
  static validateNumeric(value: string, fieldName: string): ValidationResult {
    if (!value || !value.trim()) {
      return { isValid: false, message: `${fieldName} harus diisi` };
    }

    if (isNaN(Number(value))) {
      return { isValid: false, message: `${fieldName} harus berupa angka` };
    }

    return { isValid: true };
  }

  // Positive number validation
  static validatePositiveNumber(value: string | number, fieldName: string): ValidationResult {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return { isValid: false, message: `${fieldName} harus berupa angka` };
    }

    if (numValue <= 0) {
      return { isValid: false, message: `${fieldName} harus lebih dari 0` };
    }

    return { isValid: true };
  }

  // URL validation
  static validateUrl(url: string): ValidationResult {
    if (!url || !url.trim()) {
      return { isValid: false, message: 'URL harus diisi' };
    }

    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return { isValid: false, message: 'Format URL tidak valid' };
    }
  }

  // Date validation (YYYY-MM-DD format)
  static validateDate(dateString: string): ValidationResult {
    if (!dateString || !dateString.trim()) {
      return { isValid: false, message: 'Tanggal harus diisi' };
    }

    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return { isValid: false, message: 'Format tanggal tidak valid' };
    }

    return { isValid: true };
  }

  // Batch validation - validate multiple fields at once
  static validateBatch(validations: Array<() => ValidationResult>): ValidationResult {
    for (const validate of validations) {
      const result = validate();
      if (!result.isValid) {
        return result;
      }
    }

    return { isValid: true };
  }

  // Helper method to clean phone number
  static cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Convert +62 to 0
    if (cleaned.startsWith('+62')) {
      cleaned = '0' + cleaned.substring(3);
    } else if (cleaned.startsWith('62') && cleaned.length > 10) {
      cleaned = '0' + cleaned.substring(2);
    }

    return cleaned;
  }

  // Helper method to format phone number for display
  static formatPhoneNumber(phone: string): string {
    const cleaned = this.cleanPhoneNumber(phone);
    
    if (cleaned.startsWith('08') && cleaned.length >= 10) {
      // Mobile number format: 0812-3456-7890
      return cleaned.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
    } else if (cleaned.startsWith('0') && cleaned.length >= 8) {
      // Landline format: 021-1234-5678
      return cleaned.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
    }
    
    return phone; // Return original if can't format
  }
}

export default ValidationUtils;
