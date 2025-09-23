import * as SQLite from 'expo-sqlite';

export interface User {
  id: number;
  username: string;
  password: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  transaction_date: string;
  jenis_barang: string;
  bruto_kg: number;
  tare_kg: number;
  netto_kg: number;
  pot_percentage: number;
  pot_kg: number;
  harga_per_kg: number;
  total_kg: number;
  total_harga: number;
  admin_name: string;
  customer_name: string;
  alamat: string;
  phone: string;
  catatan: string;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  id: number;
  user_id: number;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_phone_label: string;
  footer_text: string;
  show_admin: boolean;
  show_customer: boolean;
  show_notes: boolean;
  paper_width: number;
  font_size_header: number;
  font_size_body: number;
  font_size_footer: number;
  use_separator_lines: boolean;
  separator_char: string;
  date_format: string;
  show_time: boolean;
  decimal_places: number;
  thousand_separator: string;
  decimal_separator: string;
  currency_symbol: string;
  created_at: string;
  updated_at: string;
}

export interface AppSettings {
  id: number;
  user_id: number;
  setting_key: string;
  setting_value: string;
  created_at: string;
  updated_at: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('timbang_cerdas.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create users table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create transactions table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        transaction_date DATE NOT NULL,
        jenis_barang VARCHAR(100) NOT NULL,
        bruto_kg DECIMAL(10,2) NOT NULL,
        tare_kg DECIMAL(10,2) NOT NULL,
        netto_kg DECIMAL(10,2) NOT NULL,
        pot_percentage DECIMAL(5,2) DEFAULT 0,
        pot_kg DECIMAL(10,2) DEFAULT 0,
        harga_per_kg DECIMAL(15,2) NOT NULL,
        total_kg DECIMAL(10,2) NOT NULL,
        total_harga DECIMAL(15,2) NOT NULL,
        admin_name VARCHAR(100) NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        alamat TEXT,
        phone VARCHAR(20),
        catatan TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create company_settings table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_name VARCHAR(100) DEFAULT 'RAM SEKAWAN JAYA SEJAHTERA',
        company_address TEXT DEFAULT 'Kelurahan Sari Bungamas Lahat',
        company_phone VARCHAR(20) DEFAULT '0813 7779 0785',
        company_phone_label VARCHAR(20) DEFAULT '(manual)',
        footer_text TEXT DEFAULT 'Terima Kasih',
        show_admin BOOLEAN DEFAULT 1,
        show_customer BOOLEAN DEFAULT 1,
        show_notes BOOLEAN DEFAULT 1,
        paper_width INTEGER DEFAULT 58,
        font_size_header INTEGER DEFAULT 12,
        font_size_body INTEGER DEFAULT 10,
        font_size_footer INTEGER DEFAULT 10,
        use_separator_lines BOOLEAN DEFAULT 1,
        separator_char VARCHAR(5) DEFAULT '-',
        date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
        show_time BOOLEAN DEFAULT 0,
        decimal_places INTEGER DEFAULT 0,
        thousand_separator VARCHAR(5) DEFAULT '.',
        decimal_separator VARCHAR(5) DEFAULT ',',
        currency_symbol VARCHAR(10) DEFAULT 'Rp',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create app_settings table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        setting_key VARCHAR(50) NOT NULL,
        setting_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, setting_key)
      );
    `);

    // Create indexes for performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
      CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_name);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON company_settings(user_id);
    `);

    // Create trigger for default company settings
    await this.db.execAsync(`
      CREATE TRIGGER IF NOT EXISTS create_default_company_settings 
      AFTER INSERT ON users
      BEGIN
        INSERT INTO company_settings (user_id) VALUES (NEW.id);
      END;
    `);

    console.log('Database tables created successfully');
  }

  // User Management
  async createUser(username: string, hashedPassword: string, fullName: string): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.runAsync(
        'INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)',
        [username, hashedPassword, fullName]
      );

      const user = await this.db.getFirstAsync<User>(
        'SELECT * FROM users WHERE id = ?',
        [result.lastInsertRowId]
      );

      if (!user) throw new Error('Failed to create user');
      return user;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const user = await this.db.getFirstAsync<User>(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return user || null;
    } catch (error) {
      console.error('Get user by username error:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const user = await this.db.getFirstAsync<User>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return user || null;
    } catch (error) {
      console.error('Get user by id error:', error);
      throw error;
    }
  }

  async updateUser(id: number, fullName: string, username?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      if (username) {
        await this.db.runAsync(
          'UPDATE users SET full_name = ?, username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [fullName, username, id]
        );
      } else {
        await this.db.runAsync(
          'UPDATE users SET full_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [fullName, id]
        );
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, id]
      );
    } catch (error) {
      console.error('Update user password error:', error);
      throw error;
    }
  }

  // Transaction Management
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.runAsync(
        `INSERT INTO transactions (
          user_id, transaction_date, jenis_barang, bruto_kg, tare_kg, 
          netto_kg, pot_percentage, pot_kg, harga_per_kg, total_kg, 
          total_harga, admin_name, customer_name, alamat, phone, catatan
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transaction.user_id,
          transaction.transaction_date,
          transaction.jenis_barang,
          transaction.bruto_kg,
          transaction.tare_kg,
          transaction.netto_kg,
          transaction.pot_percentage,
          transaction.pot_kg,
          transaction.harga_per_kg,
          transaction.total_kg,
          transaction.total_harga,
          transaction.admin_name,
          transaction.customer_name,
          transaction.alamat,
          transaction.phone,
          transaction.catatan,
        ]
      );

      const newTransaction = await this.db.getFirstAsync<Transaction>(
        'SELECT * FROM transactions WHERE id = ?',
        [result.lastInsertRowId]
      );

      if (!newTransaction) throw new Error('Failed to create transaction');
      return newTransaction;
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  }

  async getUserTransactions(userId: number, limit?: number, offset?: number): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      let query = 'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC, id DESC';
      const params: any[] = [userId];

      if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
      }

      if (offset) {
        query += ' OFFSET ?';
        params.push(offset);
      }

      const transactions = await this.db.getAllAsync<Transaction>(query, params);
      return transactions;
    } catch (error) {
      console.error('Get user transactions error:', error);
      throw error;
    }
  }

  async getTransactionById(id: number, userId: number): Promise<Transaction | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const transaction = await this.db.getFirstAsync<Transaction>(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return transaction || null;
    } catch (error) {
      console.error('Get transaction by id error:', error);
      throw error;
    }
  }

  async searchTransactions(userId: number, searchTerm: string): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const transactions = await this.db.getAllAsync<Transaction>(
        `SELECT * FROM transactions 
         WHERE user_id = ? 
         AND (customer_name LIKE ? OR jenis_barang LIKE ?)
         ORDER BY created_at DESC`,
        [userId, `%${searchTerm}%`, `%${searchTerm}%`]
      );
      return transactions;
    } catch (error) {
      console.error('Search transactions error:', error);
      throw error;
    }
  }

  async updateTransaction(id: number, userId: number, transaction: Partial<Transaction>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `UPDATE transactions SET 
         jenis_barang = ?, bruto_kg = ?, tare_kg = ?, netto_kg = ?, 
         pot_percentage = ?, pot_kg = ?, harga_per_kg = ?, total_kg = ?, 
         total_harga = ?, admin_name = ?, customer_name = ?, alamat = ?, 
         phone = ?, catatan = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`,
        [
          transaction.jenis_barang,
          transaction.bruto_kg,
          transaction.tare_kg,
          transaction.netto_kg,
          transaction.pot_percentage,
          transaction.pot_kg,
          transaction.harga_per_kg,
          transaction.total_kg,
          transaction.total_harga,
          transaction.admin_name,
          transaction.customer_name,
          transaction.alamat,
          transaction.phone,
          transaction.catatan,
          id,
          userId,
        ]
      );
    } catch (error) {
      console.error('Update transaction error:', error);
      throw error;
    }
  }

  async deleteTransaction(id: number, userId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        'DELETE FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );
    } catch (error) {
      console.error('Delete transaction error:', error);
      throw error;
    }
  }

  async getTransactionsByDateRange(userId: number, startDate: string, endDate: string): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const transactions = await this.db.getAllAsync<Transaction>(
        'SELECT * FROM transactions WHERE user_id = ? AND transaction_date BETWEEN ? AND ? ORDER BY created_at DESC',
        [userId, startDate, endDate]
      );
      return transactions;
    } catch (error) {
      console.error('Get transactions by date range error:', error);
      throw error;
    }
  }

  // Company Settings Management
  async getCompanySettings(userId: number): Promise<CompanySettings | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const settings = await this.db.getFirstAsync<CompanySettings>(
        'SELECT * FROM company_settings WHERE user_id = ?',
        [userId]
      );
      return settings || null;
    } catch (error) {
      console.error('Get company settings error:', error);
      throw error;
    }
  }

  async updateCompanySettings(userId: number, settings: Partial<CompanySettings>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `UPDATE company_settings SET 
         company_name = ?, company_address = ?, company_phone = ?, 
         company_phone_label = ?, footer_text = ?, paper_width = ?, 
         font_size_header = ?, font_size_body = ?, date_format = ?, 
         decimal_places = ?, thousand_separator = ?, decimal_separator = ?, 
         currency_symbol = ?, show_admin = ?, show_customer = ?, 
         show_notes = ?, show_time = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          settings.company_name,
          settings.company_address,
          settings.company_phone,
          settings.company_phone_label,
          settings.footer_text,
          settings.paper_width,
          settings.font_size_header,
          settings.font_size_body,
          settings.date_format,
          settings.decimal_places,
          settings.thousand_separator,
          settings.decimal_separator,
          settings.currency_symbol,
          settings.show_admin ? 1 : 0,
          settings.show_customer ? 1 : 0,
          settings.show_notes ? 1 : 0,
          settings.show_time ? 1 : 0,
          userId,
        ]
      );
    } catch (error) {
      console.error('Update company settings error:', error);
      throw error;
    }
  }

  // App Settings Management
  async getAppSetting(userId: number, key: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const setting = await this.db.getFirstAsync<{ setting_value: string }>(
        'SELECT setting_value FROM app_settings WHERE user_id = ? AND setting_key = ?',
        [userId, key]
      );
      return setting?.setting_value || null;
    } catch (error) {
      console.error('Get app setting error:', error);
      throw error;
    }
  }

  async setAppSetting(userId: number, key: string, value: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO app_settings (user_id, setting_key, setting_value, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [userId, key, value]
      );
    } catch (error) {
      console.error('Set app setting error:', error);
      throw error;
    }
  }

  async getAllAppSettings(userId: number): Promise<Record<string, string>> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const settings = await this.db.getAllAsync<{ setting_key: string; setting_value: string }>(
        'SELECT setting_key, setting_value FROM app_settings WHERE user_id = ?',
        [userId]
      );

      const result: Record<string, string> = {};
      settings.forEach(setting => {
        result[setting.setting_key] = setting.setting_value;
      });

      return result;
    } catch (error) {
      console.error('Get all app settings error:', error);
      throw error;
    }
  }

  // Statistics and Analytics
  async getUserStats(userId: number): Promise<{
    totalTransactions: number;
    totalRevenue: number;
    todayTransactions: number;
    todayRevenue: number;
    weekTransactions: number;
    weekRevenue: number;
    monthTransactions: number;
    monthRevenue: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Total stats
      const totalStats = await this.db.getFirstAsync<{ count: number; revenue: number }>(
        'SELECT COUNT(*) as count, COALESCE(SUM(total_harga), 0) as revenue FROM transactions WHERE user_id = ?',
        [userId]
      );

      // Today stats
      const todayStats = await this.db.getFirstAsync<{ count: number; revenue: number }>(
        'SELECT COUNT(*) as count, COALESCE(SUM(total_harga), 0) as revenue FROM transactions WHERE user_id = ? AND transaction_date = ?',
        [userId, today]
      );

      // Week stats
      const weekStats = await this.db.getFirstAsync<{ count: number; revenue: number }>(
        'SELECT COUNT(*) as count, COALESCE(SUM(total_harga), 0) as revenue FROM transactions WHERE user_id = ? AND transaction_date >= ?',
        [userId, weekAgo]
      );

      // Month stats
      const monthStats = await this.db.getFirstAsync<{ count: number; revenue: number }>(
        'SELECT COUNT(*) as count, COALESCE(SUM(total_harga), 0) as revenue FROM transactions WHERE user_id = ? AND transaction_date >= ?',
        [userId, monthAgo]
      );

      return {
        totalTransactions: totalStats?.count || 0,
        totalRevenue: totalStats?.revenue || 0,
        todayTransactions: todayStats?.count || 0,
        todayRevenue: todayStats?.revenue || 0,
        weekTransactions: weekStats?.count || 0,
        weekRevenue: weekStats?.revenue || 0,
        monthTransactions: monthStats?.count || 0,
        monthRevenue: monthStats?.revenue || 0,
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  // Database utility
  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  // Delete all user data
  async deleteAllUserData(userId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM transactions WHERE user_id = ?', [userId]);
      await this.db.runAsync('DELETE FROM company_settings WHERE user_id = ?', [userId]);
      await this.db.runAsync('DELETE FROM app_settings WHERE user_id = ?', [userId]);
      console.log('All user data deleted successfully');
    } catch (error) {
      console.error('Delete all user data error:', error);
      throw error;
    }
  }
}

export default new DatabaseService();
