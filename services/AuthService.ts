import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService, { User } from './DatabaseService';

export interface UserSession {
  id: number;
  username: string;
  full_name: string;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  full_name: string;
}

class AuthService {
  private static readonly SESSION_KEY = 'user_session';
  private static readonly SALT_ROUNDS = 10;
  private currentUser: UserSession | null = null;

  // Hash password using expo-crypto
  private async hashPassword(password: string): Promise<string> {
    try {
      // Generate a random salt
      const salt = Math.random().toString(36).substring(2, 15);
      // Create hash with password + salt
      const textToHash = password + salt;
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        textToHash
      );
      // Return salt + hash combined
      return salt + ':' + hashedPassword;
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new Error('Failed to hash password');
    }
  }

  // Compare password with hash
  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      // Split salt and hash
      const [salt, hash] = hashedPassword.split(':');
      if (!salt || !hash) {
        return false;
      }
      
      // Hash the provided password with the stored salt
      const textToHash = password + salt;
      const computedHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        textToHash
      );
      
      // Compare hashes
      return computedHash === hash;
    } catch (error) {
      console.error('Password comparison error:', error);
      throw new Error('Failed to compare password');
    }
  }

  // Save user session to AsyncStorage
  private async saveSession(user: UserSession): Promise<void> {
    try {
      await AsyncStorage.setItem(AuthService.SESSION_KEY, JSON.stringify(user));
      this.currentUser = user;
      console.log('User session saved successfully');
    } catch (error) {
      console.error('Save session error:', error);
      throw new Error('Failed to save user session');
    }
  }

  // Clear user session from AsyncStorage
  private async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AuthService.SESSION_KEY);
      this.currentUser = null;
      console.log('User session cleared successfully');
    } catch (error) {
      console.error('Clear session error:', error);
      throw new Error('Failed to clear user session');
    }
  }

  // Get user session from AsyncStorage
  async getStoredSession(): Promise<UserSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(AuthService.SESSION_KEY);
      if (sessionData) {
        const user = JSON.parse(sessionData) as UserSession;
        this.currentUser = user;
        return user;
      }
      return null;
    } catch (error) {
      console.error('Get stored session error:', error);
      return null;
    }
  }

  // Get current user
  getCurrentUser(): UserSession | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Validate input for registration
  private validateRegisterInput(credentials: RegisterCredentials): { valid: boolean; message?: string } {
    const { username, password, full_name } = credentials;

    // Check required fields
    if (!username?.trim()) {
      return { valid: false, message: 'Username harus diisi' };
    }

    if (!password?.trim()) {
      return { valid: false, message: 'Password harus diisi' };
    }

    if (!full_name?.trim()) {
      return { valid: false, message: 'Nama lengkap harus diisi' };
    }

    // Validate username format
    if (username.length < 3) {
      return { valid: false, message: 'Username minimal 3 karakter' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, message: 'Username hanya boleh mengandung huruf, angka, dan underscore' };
    }

    // Validate password
    if (password.length < 6) {
      return { valid: false, message: 'Password minimal 6 karakter' };
    }

    // Validate full name
    if (full_name.length < 2) {
      return { valid: false, message: 'Nama lengkap minimal 2 karakter' };
    }

    return { valid: true };
  }

  // Validate input for login
  private validateLoginInput(credentials: LoginCredentials): { valid: boolean; message?: string } {
    const { username, password } = credentials;

    if (!username?.trim()) {
      return { valid: false, message: 'Username harus diisi' };
    }

    if (!password?.trim()) {
      return { valid: false, message: 'Password harus diisi' };
    }

    return { valid: true };
  }

  // Register new user
  async register(credentials: RegisterCredentials): Promise<{ success: boolean; message?: string; user?: UserSession }> {
    try {
      // Validate input
      const validation = this.validateRegisterInput(credentials);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      const { username, password, full_name } = credentials;

      // Check if username already exists
      const existingUser = await DatabaseService.getUserByUsername(username.toLowerCase());
      if (existingUser) {
        return { success: false, message: 'Username sudah digunakan' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user in database
      const newUser = await DatabaseService.createUser(
        username.toLowerCase(),
        hashedPassword,
        full_name.trim()
      );

      // Create user session
      const userSession: UserSession = {
        id: newUser.id,
        username: newUser.username,
        full_name: newUser.full_name,
        created_at: newUser.created_at,
      };

      // Save session
      await this.saveSession(userSession);

      console.log('User registered successfully:', userSession.username);
      return { 
        success: true, 
        message: 'Registrasi berhasil! Selamat datang di Timbang Cerdas.', 
        user: userSession 
      };

    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Registrasi gagal. Silakan coba lagi.' 
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{ success: boolean; message?: string; user?: UserSession }> {
    try {
      // Validate input
      const validation = this.validateLoginInput(credentials);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      const { username, password } = credentials;

      // Get user from database
      const user = await DatabaseService.getUserByUsername(username.toLowerCase());
      if (!user) {
        return { success: false, message: 'Username atau password salah' };
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Username atau password salah' };
      }

      // Create user session
      const userSession: UserSession = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        created_at: user.created_at,
      };

      // Save session
      await this.saveSession(userSession);

      console.log('User logged in successfully:', userSession.username);
      return { 
        success: true, 
        message: `Selamat datang kembali, ${user.full_name}!`, 
        user: userSession 
      };

    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login gagal. Silakan coba lagi.' 
      };
    }
  }

  // Logout user
  async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      await this.clearSession();
      console.log('User logged out successfully');
      return { success: true, message: 'Logout berhasil' };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Logout gagal' 
      };
    }
  }

  // Update user profile
  async updateProfile(fullName: string, username?: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, message: 'User tidak ditemukan' };
      }

      if (!fullName?.trim()) {
        return { success: false, message: 'Nama lengkap harus diisi' };
      }

      if (fullName.trim().length < 2) {
        return { success: false, message: 'Nama lengkap minimal 2 karakter' };
      }

      // If username is provided, validate and check uniqueness
      if (username) {
        if (username.length < 3) {
          return { success: false, message: 'Username minimal 3 karakter' };
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          return { success: false, message: 'Username hanya boleh mengandung huruf, angka, dan underscore' };
        }

        // Check if username is taken (except by current user)
        const existingUser = await DatabaseService.getUserByUsername(username.toLowerCase());
        if (existingUser && existingUser.id !== this.currentUser.id) {
          return { success: false, message: 'Username sudah digunakan' };
        }
      }

      // Update user in database
      await DatabaseService.updateUser(
        this.currentUser.id,
        fullName.trim(),
        username?.toLowerCase()
      );

      // Update current session
      const updatedSession: UserSession = {
        ...this.currentUser,
        full_name: fullName.trim(),
        username: username?.toLowerCase() || this.currentUser.username,
      };

      await this.saveSession(updatedSession);

      return { success: true, message: 'Profil berhasil diperbarui' };

    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Gagal memperbarui profil' 
      };
    }
  }

  // Change user password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, message: 'User tidak ditemukan' };
      }

      if (!currentPassword?.trim()) {
        return { success: false, message: 'Password lama harus diisi' };
      }

      if (!newPassword?.trim()) {
        return { success: false, message: 'Password baru harus diisi' };
      }

      if (newPassword.length < 6) {
        return { success: false, message: 'Password baru minimal 6 karakter' };
      }

      // Get current user from database
      const user = await DatabaseService.getUserById(this.currentUser.id);
      if (!user) {
        return { success: false, message: 'User tidak ditemukan' };
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return { success: false, message: 'Password lama tidak sesuai' };
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password in database
      await DatabaseService.updateUserPassword(this.currentUser.id, hashedNewPassword);

      return { success: true, message: 'Password berhasil diubah' };

    } catch (error) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Gagal mengubah password' 
      };
    }
  }

  // Initialize auth service (check for existing session)
  async initialize(): Promise<void> {
    try {
      const storedSession = await this.getStoredSession();
      if (storedSession) {
        // Verify that the user still exists in database
        const user = await DatabaseService.getUserById(storedSession.id);
        if (user) {
          this.currentUser = storedSession;
          console.log('User session restored:', storedSession.username);
        } else {
          // User no longer exists, clear invalid session
          await this.clearSession();
          console.log('Invalid session cleared');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear session on initialization error
      await this.clearSession();
    }
  }

  // Refresh user session data
  async refreshSession(): Promise<void> {
    try {
      if (!this.currentUser) return;

      const user = await DatabaseService.getUserById(this.currentUser.id);
      if (user) {
        const updatedSession: UserSession = {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          created_at: user.created_at,
        };

        await this.saveSession(updatedSession);
      } else {
        // User no longer exists
        await this.clearSession();
      }
    } catch (error) {
      console.error('Refresh session error:', error);
    }
  }
}

export default new AuthService();
