import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import {
  ChevronRight,
  Download,
  Edit3,
  Info,
  Lock,
  LogOut,
  Save,
  Settings,
  Shield,
  Trash2,
  Upload,
  User,
  X
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthService from "../../services/AuthService";
import DatabaseService from "../../services/DatabaseService";

interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  created_at: string;
  total_transactions: number;
  total_revenue: number;
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 1,
    username: "admin",
    full_name: "Administrator",
    created_at: "2024-01-01T00:00:00Z",
    total_transactions: 145,
    total_revenue: 125750000,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: "",
    username: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const loadUserProfile = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        Alert.alert("Error", "Session expired. Please login again.");
        router.replace("/(auth)/login");
        return;
      }

      // Load user statistics from database
      const userTransactions = await DatabaseService.getUserTransactions(currentUser.id);
      const totalTransactions = userTransactions.length;
      const totalRevenue = userTransactions.reduce((sum, transaction) => sum + transaction.total_harga, 0);

      setUserProfile({
        id: currentUser.id,
        username: currentUser.username,
        full_name: currentUser.full_name,
        created_at: currentUser.created_at,
        total_transactions: totalTransactions,
        total_revenue: totalRevenue,
      });
      
      console.log("User profile loaded successfully");
    } catch (error) {
      console.error("Failed to load user profile:", error);
      Alert.alert("Error", "Gagal memuat profil pengguna");
    }
  };

  useEffect(() => {
    setEditForm({
      full_name: userProfile.full_name,
      username: userProfile.username,
    });
  }, [userProfile.full_name, userProfile.username]);

  // Refresh profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [])
  );

  const handleEditProfile = () => {
    setEditForm({
      full_name: userProfile.full_name,
      username: userProfile.username,
    });
    setShowEditModal(true);
  };

  const saveProfileChanges = async () => {
    if (!editForm.full_name.trim()) {
      Alert.alert("Error", "Nama lengkap harus diisi");
      return;
    }

    if (!editForm.username.trim()) {
      Alert.alert("Error", "Username harus diisi");
      return;
    }

    setLoading(true);
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        Alert.alert("Error", "Session expired. Please login again.");
        router.replace("/(auth)/login");
        return;
      }

      // Check if username is already taken (if changed)
      if (editForm.username !== currentUser.username) {
        const existingUser = await DatabaseService.getUserByUsername(editForm.username);
        if (existingUser) {
          Alert.alert("Error", "Username sudah digunakan. Pilih username lain.");
          return;
        }
      }

      // Update user profile in database
      await DatabaseService.updateUserProfile(currentUser.id, {
        username: editForm.username,
        full_name: editForm.full_name,
      });
      
      // Update AuthService session
      AuthService.updateCurrentUser({
        ...currentUser,
        username: editForm.username,
        full_name: editForm.full_name,
      });
      
      setUserProfile(prev => ({
        ...prev,
        full_name: editForm.full_name,
        username: editForm.username,
      }));

      setShowEditModal(false);
      Alert.alert("Berhasil", "Profil berhasil diperbarui");
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordModal(true);
  };

  const savePasswordChanges = async () => {
    if (!passwordForm.currentPassword.trim()) {
      Alert.alert("Error", "Password lama harus diisi");
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      Alert.alert("Error", "Password baru harus diisi");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Error", "Password baru minimal 6 karakter");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Error", "Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        Alert.alert("Error", "Session expired. Please login again.");
        router.replace("/(auth)/login");
        return;
      }

      // Verify current password using AuthService
      const isValidPassword = await AuthService.verifyPassword(
        currentUser.username,
        passwordForm.currentPassword
      );

      if (!isValidPassword) {
        Alert.alert("Error", "Password lama tidak benar");
        return;
      }

      // Update password using AuthService
      const changeResult = await AuthService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      if (!changeResult.success) {
        Alert.alert("Error", changeResult.message || "Gagal mengubah password");
        return;
      }
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordModal(false);
      Alert.alert("Berhasil", "Password berhasil diubah");
    } catch (error) {
      console.error("Failed to update password:", error);
      Alert.alert("Error", "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "Pilih format export data transaksi:",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "JSON", 
          onPress: async () => {
            try {
              const currentUser = AuthService.getCurrentUser();
              if (!currentUser) {
                Alert.alert("Error", "Session expired. Please login again.");
                router.replace("/(auth)/login");
                return;
              }

              const transactions = await DatabaseService.getUserTransactions(currentUser.id);
              const companySettings = await DatabaseService.getCompanySettings(currentUser.id);
              
              const exportData = {
                user: {
                  username: currentUser.username,
                  full_name: currentUser.full_name,
                  created_at: currentUser.created_at,
                },
                company_settings: companySettings,
                transactions: transactions,
                export_date: new Date().toISOString(),
                total_transactions: transactions.length,
                total_revenue: transactions.reduce((sum, t) => sum + t.total_harga, 0),
              };
              
              // In a real app, you would save this to file system and share
              console.log('Export Data (JSON):', JSON.stringify(exportData, null, 2));
              Alert.alert("Berhasil", `Data berhasil diekspor!\n\nTotal: ${transactions.length} transaksi\nFormat: JSON`);
            } catch (error) {
              console.error('Export error:', error);
              Alert.alert("Error", "Gagal mengekspor data");
            }
          }
        },
        { 
          text: "CSV", 
          onPress: async () => {
            try {
              const currentUser = AuthService.getCurrentUser();
              if (!currentUser) {
                Alert.alert("Error", "Session expired. Please login again.");
                router.replace("/(auth)/login");
                return;
              }

              const transactions = await DatabaseService.getUserTransactions(currentUser.id);
              
              // Create CSV headers
              const csvHeaders = [
                'ID', 'Tanggal', 'Customer', 'Jenis Barang', 'Bruto (Kg)', 'Tare (Kg)', 
                'Netto (Kg)', 'Pot (%)', 'Pot (Kg)', 'Total (Kg)', 'Harga/Kg', 'Total Harga', 
                'Admin', 'Catatan', 'Dibuat'
              ].join(',');
              
              // Create CSV rows
              const csvRows = transactions.map(t => [
                t.id, t.transaction_date, `"${t.customer_name}"`, `"${t.jenis_barang}"`,
                t.bruto_kg, t.tare_kg, t.netto_kg, t.pot_percentage, t.pot_kg, t.total_kg,
                t.harga_per_kg, t.total_harga, `"${t.admin_name}"`, `"${t.catatan || ''}"`, t.created_at
              ].join(','));
              
              const csvContent = [csvHeaders, ...csvRows].join('\n');
              
              // In a real app, you would save this to file system and share
              console.log('Export Data (CSV):', csvContent);
              Alert.alert("Berhasil", `Data berhasil diekspor!\n\nTotal: ${transactions.length} transaksi\nFormat: CSV`);
            } catch (error) {
              console.error('Export error:', error);
              Alert.alert("Error", "Gagal mengekspor data");
            }
          }
        },
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      "Import Data",
      "Apakah Anda yakin ingin mengimport data? Data yang ada akan ditambahkan dengan data baru.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Import",
          onPress: () => {
            // TODO: Implement data import
            Alert.alert("Info", "Fitur import data akan diimplementasikan");
          }
        }
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      "Hapus Semua Data",
      "PERINGATAN: Aksi ini akan menghapus SEMUA data transaksi secara permanen. Aksi ini tidak dapat dibatalkan!\n\nApakah Anda yakin?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "HAPUS SEMUA",
          style: "destructive",
          onPress: () => {
            Alert.prompt(
              "Konfirmasi Terakhir",
              "Ketik 'HAPUS' (huruf kapital) untuk mengkonfirmasi penghapusan semua data:",
              [
                { text: "Batal", style: "cancel" },
                {
                  text: "Konfirmasi",
                  style: "destructive",
                  onPress: async (input: string | undefined) => {
                    if (input !== 'HAPUS') {
                      Alert.alert("Error", "Konfirmasi tidak sesuai. Penghapusan dibatalkan.");
                      return;
                    }
                    
                    try {
                      const currentUser = AuthService.getCurrentUser();
                      if (!currentUser) {
                        Alert.alert("Error", "Session expired. Please login again.");
                        router.replace("/(auth)/login");
                        return;
                      }

                      // Delete all user data
                      await DatabaseService.deleteAllUserData(currentUser.id);
                      
                      // Refresh profile data to update statistics
                      await loadUserProfile();
                      
                      Alert.alert("Berhasil", "Semua data transaksi berhasil dihapus");
                    } catch (error) {
                      console.error('Delete all data error:', error);
                      Alert.alert("Error", "Gagal menghapus data");
                    }
                  }
                }
              ],
              'plain-text'
            );
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Apakah Anda yakin ingin keluar dari aplikasi?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await AuthService.logout();
              if (result.success) {
                router.replace("/(auth)/login");
              } else {
                Alert.alert("Error", result.message || "Logout gagal");
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert("Error", "Terjadi kesalahan saat logout");
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const renderMenuItem = (icon: React.ReactNode, title: string, subtitle: string, onPress: () => void, isDestructive = false) => (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        marginBottom: 1,
      }}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isDestructive ? '#fee2e2' : '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: isDestructive ? '#dc2626' : '#111827',
          marginBottom: 2,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 12,
          color: '#6b7280',
        }}>
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={20} color="#9ca3af" />
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
          Profil
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={{ padding: 24 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#2563eb',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <User size={40} color="white" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
                {userProfile.full_name}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                @{userProfile.username}
              </Text>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                Bergabung sejak {formatDate(userProfile.created_at)}
              </Text>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 }}>
                  {userProfile.total_transactions}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  Total Transaksi
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#e5e7eb', marginHorizontal: 16 }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#16a34a', marginBottom: 4 }}>
                  {formatCurrency(userProfile.total_revenue)}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  Total Pendapatan
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
              Pengaturan Akun
            </Text>
          </View>
          
          <View style={{ backgroundColor: 'white', marginHorizontal: 24, borderRadius: 12, overflow: 'hidden' }}>
            {renderMenuItem(
              <Edit3 size={20} color="#2563eb" />,
              "Edit Profil",
              "Ubah nama dan username",
              handleEditProfile
            )}
            {renderMenuItem(
              <Lock size={20} color="#2563eb" />,
              "Ubah Password",
              "Ganti password akun",
              handleChangePassword
            )}
            {renderMenuItem(
              <Settings size={20} color="#2563eb" />,
              "Pengaturan Aplikasi",
              "Konfigurasi aplikasi dan struk",
              () => router.push("/(tabs)/settings")
            )}
          </View>
        </View>

        {/* Data Management */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
              Manajemen Data
            </Text>
          </View>
          
          <View style={{ backgroundColor: 'white', marginHorizontal: 24, borderRadius: 12, overflow: 'hidden' }}>
            {renderMenuItem(
              <Download size={20} color="#16a34a" />,
              "Export Data",
              "Ekspor data ke file JSON/CSV",
              handleExportData
            )}
            {renderMenuItem(
              <Upload size={20} color="#f59e0b" />,
              "Import Data",
              "Import data dari file backup",
              handleImportData
            )}
            {renderMenuItem(
              <Trash2 size={20} color="#dc2626" />,
              "Hapus Semua Data",
              "Menghapus seluruh data transaksi",
              handleDeleteAllData,
              true
            )}
          </View>
        </View>

        {/* About */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
              Tentang
            </Text>
          </View>
          
          <View style={{ backgroundColor: 'white', marginHorizontal: 24, borderRadius: 12, overflow: 'hidden' }}>
            {renderMenuItem(
              <Info size={20} color="#6b7280" />,
              "Versi Aplikasi",
              "Timbang Cerdas v1.0.0",
              () => Alert.alert("Info", "Timbang Cerdas\nVersi 1.0.0\n\n4SEKAWAN")
            )}
            {renderMenuItem(
              <Shield size={20} color="#6b7280" />,
              "Lisensi",
              "Informasi lisensi aplikasi",
              () => Alert.alert("Lisensi", "Timbang Cerdas\n© 2025 4SEKAWAN\nAll rights reserved.")
            )}
          </View>
        </View>

        {/* Logout */}
        <View style={{ marginBottom: 32, paddingHorizontal: 24 }}>
          <Pressable
            onPress={handleLogout}
            style={{
              backgroundColor: '#dc2626',
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              Logout
            </Text>
          </Pressable>
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                Edit Profil
              </Text>
              <Pressable onPress={() => setShowEditModal(false)}>
                <X size={24} color="#374151" />
              </Pressable>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Nama Lengkap *
              </Text>
              <TextInput
                value={editForm.full_name}
                onChangeText={(value) => setEditForm(prev => ({ ...prev, full_name: value }))}
                placeholder="Masukkan nama lengkap"
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 12,
                  color: '#111827',
                  backgroundColor: 'white',
                }}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Username *
              </Text>
              <TextInput
                value={editForm.username}
                onChangeText={(value) => setEditForm(prev => ({ ...prev, username: value }))}
                placeholder="Masukkan username"
                autoCapitalize="none"
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 12,
                  color: '#111827',
                  backgroundColor: 'white',
                }}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setShowEditModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#374151', fontWeight: '600' }}>Batal</Text>
              </Pressable>

              <Pressable
                onPress={saveProfileChanges}
                disabled={loading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: loading ? '#9ca3af' : '#2563eb',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Save size={16} color="white" style={{ marginRight: 8 }} />
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                Ubah Password
              </Text>
              <Pressable onPress={() => setShowPasswordModal(false)}>
                <X size={24} color="#374151" />
              </Pressable>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Password Lama *
              </Text>
              <TextInput
                value={passwordForm.currentPassword}
                onChangeText={(value) => setPasswordForm(prev => ({ ...prev, currentPassword: value }))}
                placeholder="Masukkan password lama"
                secureTextEntry
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 12,
                  color: '#111827',
                  backgroundColor: 'white',
                }}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Password Baru *
              </Text>
              <TextInput
                value={passwordForm.newPassword}
                onChangeText={(value) => setPasswordForm(prev => ({ ...prev, newPassword: value }))}
                placeholder="Masukkan password baru (min. 6 karakter)"
                secureTextEntry
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 12,
                  color: '#111827',
                  backgroundColor: 'white',
                }}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Konfirmasi Password Baru *
              </Text>
              <TextInput
                value={passwordForm.confirmPassword}
                onChangeText={(value) => setPasswordForm(prev => ({ ...prev, confirmPassword: value }))}
                placeholder="Masukkan ulang password baru"
                secureTextEntry
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 12,
                  color: '#111827',
                  backgroundColor: 'white',
                }}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setShowPasswordModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#374151', fontWeight: '600' }}>Batal</Text>
              </Pressable>

              <Pressable
                onPress={savePasswordChanges}
                disabled={loading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: loading ? '#9ca3af' : '#2563eb',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Save size={16} color="white" style={{ marginRight: 8 }} />
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
