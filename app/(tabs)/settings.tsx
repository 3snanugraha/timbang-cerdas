import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import {
  Building2,
  FileText,
  Info,
  LogOut,
  Printer,
  Save,
  User,
  X
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThermalReceiptTemplate } from '../../components/thermal';
import AuthService from "../../services/AuthService";
import DatabaseService from "../../services/DatabaseService";

// UI state interface (subset of CompanySettings for form state)
interface CompanySettingsUI {
  company_name: string;
  company_address: string;
  company_phone: string;
  footer_text: string;
  show_admin: boolean;
  show_customer: boolean;
  show_notes: boolean;
  date_format: string;
  show_time: boolean;
  decimal_places: number;
  thousand_separator: string;
  currency_symbol: string;
}


type SettingsTab = 'company' | 'receipt';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [companySettings, setCompanySettings] = useState<CompanySettingsUI>({
    company_name: "RAM SEKAWAN JAYA SEJAHTERA",
    company_address: "Kelurahan Sari Bungamas Lahat",
    company_phone: "0813 7779 0785",
    footer_text: "Terima Kasih",
    show_admin: true,
    show_customer: true,
    show_notes: true,
    date_format: "DD/MM/YYYY",
    show_time: false,
    decimal_places: 0,
    thousand_separator: ".",
    currency_symbol: "Rp",
  });


  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        Alert.alert("Error", "Session expired. Please login again.");
        router.replace("/(auth)/login");
        return;
      }

      // Load company settings from database
      const dbSettings = await DatabaseService.getCompanySettings(currentUser.id);
      console.log("Loaded dbSettings:", dbSettings);
      if (dbSettings) {
        console.log("Setting company settings with:", {
          show_admin: dbSettings.show_admin,
          show_customer: dbSettings.show_customer,
          show_notes: dbSettings.show_notes,
          show_time: dbSettings.show_time
        });
        console.log("Converted to boolean:", {
          show_admin: Boolean(dbSettings.show_admin),
          show_customer: Boolean(dbSettings.show_customer),
          show_notes: Boolean(dbSettings.show_notes),
          show_time: Boolean(dbSettings.show_time)
        });
        setCompanySettings({
          company_name: dbSettings.company_name,
          company_address: dbSettings.company_address,
          company_phone: dbSettings.company_phone,
          footer_text: dbSettings.footer_text,
          show_admin: Boolean(dbSettings.show_admin),
          show_customer: Boolean(dbSettings.show_customer),
          show_notes: Boolean(dbSettings.show_notes),
          date_format: dbSettings.date_format,
          show_time: Boolean(dbSettings.show_time),
          decimal_places: dbSettings.decimal_places || 0,
          thousand_separator: dbSettings.thousand_separator,
          currency_symbol: dbSettings.currency_symbol,
        });
      } else {
        console.log("No dbSettings found, creating default settings in database");
        // Create default settings in database if none exist
        await DatabaseService.saveCompanySettings(currentUser.id, {
          company_name: "RAM SEKAWAN JAYA SEJAHTERA",
          company_address: "Kelurahan Sari Bungamas Lahat",
          company_phone: "0813 7779 0785",
          company_phone_label: "",
          footer_text: "Terima Kasih",
          show_admin: true,
          show_customer: true,
          show_notes: true,
          paper_width: 58,
          font_size_header: 12,
          font_size_body: 10,
          font_size_footer: 10,
          use_separator_lines: true,
          separator_char: "-",
          date_format: "DD/MM/YYYY",
          show_time: false,
          decimal_places: 0,
          thousand_separator: ".",
          decimal_separator: ",",
          currency_symbol: "Rp",
        });
        // Reload settings after creating defaults
        const newDbSettings = await DatabaseService.getCompanySettings(currentUser.id);
        if (newDbSettings) {
          console.log("Setting company settings with NEW defaults:", {
            show_admin: newDbSettings.show_admin,
            show_customer: newDbSettings.show_customer,
            show_notes: newDbSettings.show_notes,
            show_time: newDbSettings.show_time
          });
          setCompanySettings({
            company_name: newDbSettings.company_name,
            company_address: newDbSettings.company_address,
            company_phone: newDbSettings.company_phone,
            footer_text: newDbSettings.footer_text,
            show_admin: Boolean(newDbSettings.show_admin),
            show_customer: Boolean(newDbSettings.show_customer),
            show_notes: Boolean(newDbSettings.show_notes),
            date_format: newDbSettings.date_format,
            show_time: Boolean(newDbSettings.show_time),
            decimal_places: newDbSettings.decimal_places || 0,
            thousand_separator: newDbSettings.thousand_separator,
            currency_symbol: newDbSettings.currency_symbol,
          });
        }
      }

      console.log("Settings loaded successfully");
    } catch (error) {
      console.error("Failed to load settings:", error);
      Alert.alert("Error", "Gagal memuat pengaturan");
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Refresh settings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const saveCompanySettings = async () => {
    setLoading(true);
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        Alert.alert("Error", "Session expired. Please login again.");
        router.replace("/(auth)/login");
        return;
      }

      // Validate required fields
      if (!companySettings.company_name.trim()) {
        Alert.alert("Error", "Nama perusahaan harus diisi");
        return;
      }
      if (!companySettings.company_address.trim()) {
        Alert.alert("Error", "Alamat perusahaan harus diisi");
        return;
      }
      if (!companySettings.company_phone.trim()) {
        Alert.alert("Error", "Nomor HP harus diisi");
        return;
      }

      // Save to database with default thermal settings (58mm)
      await DatabaseService.saveCompanySettings(currentUser.id, {
        company_name: companySettings.company_name,
        company_address: companySettings.company_address,
        company_phone: companySettings.company_phone,
        company_phone_label: "",  // Remove manual label
        footer_text: companySettings.footer_text,
        show_admin: companySettings.show_admin,
        show_customer: companySettings.show_customer,
        show_notes: companySettings.show_notes,
        paper_width: 58,  // Fixed 58mm thermal
        font_size_header: 12,  // Default thermal sizes
        font_size_body: 10,
        font_size_footer: 10,
        use_separator_lines: true,
        separator_char: "-",
        date_format: companySettings.date_format,
        show_time: companySettings.show_time,
        decimal_places: companySettings.decimal_places,
        thousand_separator: companySettings.thousand_separator,
        decimal_separator: ",",  // Fixed Indonesian format
        currency_symbol: companySettings.currency_symbol,
      });
      
      Alert.alert("Berhasil", "Pengaturan perusahaan berhasil disimpan");
    } catch (error) {
      console.error("Failed to save company settings:", error);
      Alert.alert("Error", "Gagal menyimpan pengaturan");
    } finally {
      setLoading(false);
    }
  };



  const previewReceipt = () => {
    setShowPreview(true);
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

  const renderTabButton = (tab: SettingsTab, title: string, icon: React.ReactNode) => (
    <Pressable
      onPress={() => setActiveTab(tab)}
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: activeTab === tab ? '#2563eb' : '#f3f4f6',
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <View style={{ marginRight: 8 }}>
        {icon}
      </View>
      <Text style={{
        color: activeTab === tab ? 'white' : '#374151',
        fontWeight: '600',
        fontSize: 14,
      }}>
        {title}
      </Text>
    </Pressable>
  );

  const renderCompanySettings = () => (
    <View style={{ padding: 24 }}>
      {/* Company Info */}
      <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Building2 size={20} color="#2563eb" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginLeft: 8 }}>
            Informasi Perusahaan
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
            Nama Perusahaan *
          </Text>
          <TextInput
            value={companySettings.company_name}
            onChangeText={(value) => setCompanySettings(prev => ({ ...prev, company_name: value }))}
            placeholder="Nama perusahaan"
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
            Alamat Perusahaan *
          </Text>
          <TextInput
            value={companySettings.company_address}
            onChangeText={(value) => setCompanySettings(prev => ({ ...prev, company_address: value }))}
            placeholder="Alamat lengkap perusahaan"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{
              width: '100%',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 12,
              color: '#111827',
              backgroundColor: 'white',
              minHeight: 80,
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
            Nomor HP *
          </Text>
          <TextInput
            value={companySettings.company_phone}
            onChangeText={(value) => setCompanySettings(prev => ({ ...prev, company_phone: value }))}
            placeholder="0813 xxx xxxx"
            keyboardType="phone-pad"
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
      </View>

      {/* Footer Settings */}
      <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <FileText size={20} color="#2563eb" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginLeft: 8 }}>
            Teks Footer
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
            Pesan Footer Struk
          </Text>
          <TextInput
            value={companySettings.footer_text}
            onChangeText={(value) => setCompanySettings(prev => ({ ...prev, footer_text: value }))}
            placeholder="Terima Kasih"
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
      </View>

      {/* Save Button */}
      <Pressable
        onPress={saveCompanySettings}
        disabled={loading}
        style={{
          width: '100%',
          paddingVertical: 16,
          borderRadius: 16,
          backgroundColor: loading ? '#9ca3af' : '#2563eb',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}
      >
        <Save size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
          {loading ? "Menyimpan..." : "Simpan Pengaturan"}
        </Text>
      </Pressable>
    </View>
  );

  const renderReceiptSettings = () => (
    <View style={{ padding: 24 }}>
      {/* Format Settings */}
      <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Printer size={20} color="#2563eb" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginLeft: 8 }}>
            Format Struk
          </Text>
        </View>

        {/* Fixed 58mm thermal printer info */}
        <View style={{ backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>
            Format Struk: Thermal 58mm (Fixed)
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>
            Aplikasi menggunakan format standar thermal printer 58mm dengan pengaturan optimal.
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
            Desimal Angka
          </Text>
          <TextInput
            value={companySettings.decimal_places.toString()}
            onChangeText={(value) => setCompanySettings(prev => ({ ...prev, decimal_places: parseInt(value) || 0 }))}
            placeholder="0"
            keyboardType="numeric"
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
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
              Simbol Mata Uang
            </Text>
            <TextInput
              value={companySettings.currency_symbol}
              onChangeText={(value) => setCompanySettings(prev => ({ ...prev, currency_symbol: value }))}
              placeholder="Rp"
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
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
              Pemisah Ribuan
            </Text>
            <TextInput
              value={companySettings.thousand_separator}
              onChangeText={(value) => setCompanySettings(prev => ({ ...prev, thousand_separator: value }))}
              placeholder="."
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
            />
          </View>
        </View>

        {/* Display Options */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
            Tampilan
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: loadingSettings ? '#9ca3af' : '#374151' }}>Tampilkan Admin</Text>
            <Switch
              disabled={loadingSettings}
              value={companySettings.show_admin}
              onValueChange={(value) => setCompanySettings(prev => ({ ...prev, show_admin: value }))}
              trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
              thumbColor={companySettings.show_admin ? '#ffffff' : '#d1d5db'}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: loadingSettings ? '#9ca3af' : '#374151' }}>Tampilkan Customer</Text>
            <Switch
              disabled={loadingSettings}
              value={companySettings.show_customer}
              onValueChange={(value) => setCompanySettings(prev => ({ ...prev, show_customer: value }))}
              trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
              thumbColor={companySettings.show_customer ? '#ffffff' : '#d1d5db'}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: loadingSettings ? '#9ca3af' : '#374151' }}>Tampilkan Catatan</Text>
            <Switch
              disabled={loadingSettings}
              value={companySettings.show_notes}
              onValueChange={(value) => setCompanySettings(prev => ({ ...prev, show_notes: value }))}
              trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
              thumbColor={companySettings.show_notes ? '#ffffff' : '#d1d5db'}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: loadingSettings ? '#9ca3af' : '#374151' }}>Tampilkan Waktu</Text>
            <Switch
              disabled={loadingSettings}
              value={companySettings.show_time}
              onValueChange={(value) => setCompanySettings(prev => ({ ...prev, show_time: value }))}
              trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
              thumbColor={companySettings.show_time ? '#ffffff' : '#d1d5db'}
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <Pressable
          onPress={previewReceipt}
          style={{
            flex: 1,
            paddingVertical: 16,
            borderRadius: 16,
            backgroundColor: '#16a34a',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
        >
          <FileText size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
            Preview
          </Text>
        </Pressable>

        <Pressable
          onPress={saveCompanySettings}
          disabled={loading}
          style={{
            flex: 1,
            paddingVertical: 16,
            borderRadius: 16,
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
        >
          <Save size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Text>
        </Pressable>
      </View>
    </View>
  );


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
          Pengaturan
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {renderTabButton('company', 'Perusahaan', <Building2 size={16} color={activeTab === 'company' ? 'white' : '#374151'} />)}
          {renderTabButton('receipt', 'Struk', <Printer size={16} color={activeTab === 'receipt' ? 'white' : '#374151'} />)}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'company' && renderCompanySettings()}
        {activeTab === 'receipt' && renderReceiptSettings()}
        
        {/* User Profile & Logout Section - Always visible at bottom */}
        <View style={{ padding: 24 }}>
          {/* User Profile Card */}
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <User size={20} color="#2563eb" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginLeft: 8 }}>
                Informasi User
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>
                  {AuthService.getCurrentUser()?.full_name || 'Unknown User'}
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  @{AuthService.getCurrentUser()?.username || 'unknown'}
                </Text>
                <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                  Login sejak: {AuthService.getCurrentUser()?.created_at ? new Date(AuthService.getCurrentUser()!.created_at).toLocaleDateString('id-ID') : 'Unknown'}
                </Text>
              </View>
              <Pressable
                onPress={handleLogout}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: '#dc2626',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <LogOut size={16} color="white" style={{ marginRight: 6 }} />
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                  Logout
                </Text>
              </Pressable>
            </View>
          </View>
          
          {/* App Info */}
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Info size={16} color="#6b7280" />
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginLeft: 6 }}>
                Tentang Aplikasi
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>
              Timbang Cerdas v1.0.1
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              © 2025 4SEKAWAN
            </Text>
          </View>
        </View>
        
        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                Preview Struk
              </Text>
              <Pressable onPress={() => setShowPreview(false)}>
                <X size={24} color="#374151" />
              </Pressable>
            </View>

            {/* Receipt Preview using ThermalReceiptTemplate */}
            <ThermalReceiptTemplate
              isPreview={true}
              transaction={{
                id: 1,
                user_id: 1,
                customer_name: 'Budi Santoso',
                jenis_barang: 'Kelapa Sawit',
                bruto_kg: 1500,
                tare_kg: 200,
                netto_kg: 1300,
                pot_percentage: 2,
                pot_kg: 50,
                total_kg: 1224,
                harga_per_kg: 700,
                total_harga: 856800,
                transaction_date: new Date().toISOString().split('T')[0],
                admin_name: 'Admin',
                alamat: '',
                phone: '',
                catatan: companySettings.show_notes ? 'Kualitas bagus' : '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }}
              settings={{
                company_name: companySettings.company_name,
                company_address: companySettings.company_address,
                company_phone: companySettings.company_phone,
                footer_text: companySettings.footer_text,
                show_admin: companySettings.show_admin,
                show_customer: companySettings.show_customer,
                show_notes: companySettings.show_notes,
                currency_symbol: companySettings.currency_symbol,
                thousand_separator: companySettings.thousand_separator,
                date_format: companySettings.date_format,
                show_time: companySettings.show_time,
              }}
            />

            <Pressable
              onPress={() => setShowPreview(false)}
              style={{
                marginTop: 16,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                backgroundColor: '#2563eb',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
