import { Text, View, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  ArrowLeft,
  Save,
  Calculator,
  Package,
  FileText,
  Printer,
  Send,
  X,
  CheckCircle,
  UserCheck
} from "lucide-react-native";
import { router } from "expo-router";
import AuthService from "../../services/AuthService";
import DatabaseService from "../../services/DatabaseService";
import { ThermalPrintService, ThermalReceiptPreview } from '../../components/thermal';
import type { ThermalSettings } from '../../components/thermal';

interface TransactionFormData {
  // Data Barang
  jenis_barang: string;
  
  // Data Timbangan
  bruto_kg: string;
  tare_kg: string;
  netto_kg: number;
  
  // Data Harga
  pot_percentage: string; // Potongan %
  pot_kg: string; // Potongan Kg
  harga_per_kg: string;
  total_kg: number; // Netto - Pot(Kg)
  total_harga: number;
  
  // Data Admin & Customer (simplified)
  admin_name: string;
  customer_name: string;
  
  // Catatan
  catatan: string;
}

export default function TransactionPage() {
  const [formData, setFormData] = useState<TransactionFormData>({
    jenis_barang: "",
    bruto_kg: "",
    tare_kg: "",
    netto_kg: 0,
    pot_percentage: "0",
    pot_kg: "0",
    harga_per_kg: "",
    total_kg: 0,
    total_harga: 0,
    admin_name: "", // Will be loaded from session
    customer_name: "",
    catatan: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showThermalPreview, setShowThermalPreview] = useState(false);
  const [savedTransaction, setSavedTransaction] = useState<any>(null);
  const [thermalSettings, setThermalSettings] = useState<ThermalSettings | null>(null);
  const [printLoading, setPrintLoading] = useState(false);

  // Load default data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadDefaultData();
    }, [])
  );

  const loadDefaultData = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        Alert.alert("Error", "Session expired. Please login again.");
        router.replace("/(auth)/login");
        return;
      }

      // Set admin name from current user session
      setFormData(prev => ({
        ...prev,
        admin_name: currentUser.full_name || currentUser.username
      }));

      // Load company settings for thermal printing
      try {
        const companySettings = await DatabaseService.getCompanySettings(currentUser.id);
        if (companySettings) {
          setThermalSettings({
            company_name: companySettings.company_name,
            company_address: companySettings.company_address,
            company_phone: companySettings.company_phone,
            company_phone_label: companySettings.company_phone_label,
            footer_text: companySettings.footer_text,
            show_admin: companySettings.show_admin,
            show_customer: companySettings.show_customer,
            show_notes: companySettings.show_notes,
            currency_symbol: companySettings.currency_symbol,
            thousand_separator: companySettings.thousand_separator,
            date_format: companySettings.date_format,
            show_time: companySettings.show_time,
          });
        }
      } catch (error) {
        console.error('Failed to load company settings:', error);
      }

      console.log('Default data loaded for user:', currentUser.full_name);
    } catch (error) {
      console.error('Failed to load default data:', error);
    }
  };

  const calculateValues = useCallback(() => {
    const bruto = parseFloat(formData.bruto_kg) || 0;
    const tare = parseFloat(formData.tare_kg) || 0;
    const potPercentage = parseFloat(formData.pot_percentage) || 0;
    const potKg = parseFloat(formData.pot_kg) || 0;
    const hargaPerKg = parseFloat(formData.harga_per_kg) || 0;

    // Calculate Netto = Bruto - Tare
    const netto = bruto - tare;

    // Calculate additional pot from percentage
    const additionalPotFromPercentage = (netto * potPercentage) / 100;

    // Calculate Total = Netto - Pot(Kg) - Pot(%)
    const total = netto - potKg - additionalPotFromPercentage;

    // Calculate Total Harga = Total × Harga/Kg
    const totalHarga = total * hargaPerKg;

    setFormData(prev => ({
      ...prev,
      netto_kg: Math.max(0, netto),
      total_kg: Math.max(0, total),
      total_harga: Math.max(0, totalHarga),
    }));
  }, [formData.bruto_kg, formData.tare_kg, formData.pot_percentage, formData.pot_kg, formData.harga_per_kg]);

  // Auto calculation effect
  useEffect(() => {
    calculateValues();
  }, [calculateValues]);

  const formatNumber = (num: number) => {
    return num.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.jenis_barang.trim()) {
      Alert.alert("Error", "Jenis barang harus diisi");
      return;
    }
    
    if (!formData.bruto_kg || !formData.tare_kg) {
      Alert.alert("Error", "Bruto dan Tare harus diisi");
      return;
    }
    
    if (!formData.harga_per_kg) {
      Alert.alert("Error", "Harga per kg harus diisi");
      return;
    }
    
    if (!formData.customer_name.trim()) {
      Alert.alert("Error", "Nama customer harus diisi");
      return;
    }

    if (!formData.admin_name.trim()) {
      Alert.alert("Error", "Nama admin harus diisi");
      return;
    }

    if (formData.total_kg <= 0) {
      Alert.alert("Error", "Total kg tidak valid");
      return;
    }

    setLoading(true);
    
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        Alert.alert("Error", "Session expired");
        return;
      }

      // Prepare transaction data for database
      const transactionData = {
        user_id: currentUser.id,
        transaction_date: new Date().toISOString().split('T')[0],
        jenis_barang: formData.jenis_barang.trim(),
        bruto_kg: parseFloat(formData.bruto_kg),
        tare_kg: parseFloat(formData.tare_kg),
        netto_kg: formData.netto_kg,
        pot_percentage: parseFloat(formData.pot_percentage) || 0,
        pot_kg: parseFloat(formData.pot_kg) || 0,
        harga_per_kg: parseFloat(formData.harga_per_kg),
        total_kg: formData.total_kg,
        total_harga: formData.total_harga,
        admin_name: formData.admin_name.trim(),
        customer_name: formData.customer_name.trim(),
        alamat: "", // Not used anymore
        phone: "", // Not used anymore
        catatan: formData.catatan.trim(),
      };
      
      // Save to database
      const newTransaction = await DatabaseService.createTransaction(transactionData);
      setSavedTransaction(newTransaction);
      
      // Show success modal with options
      setShowSuccessModal(true);
      
      console.log('Transaction saved successfully:', newTransaction.id);
      
    } catch (error) {
      console.error("Failed to save transaction:", error);
      Alert.alert("Error", "Gagal menyimpan transaksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setShowSuccessModal(false);
    if (savedTransaction && thermalSettings) {
      setShowThermalPreview(true);
    } else {
      Alert.alert("Error", "Data transaksi atau pengaturan tidak tersedia untuk dicetak");
    }
  };

  const handleSendPDF = async () => {
    setShowSuccessModal(false);
    if (!savedTransaction || !thermalSettings) {
      Alert.alert("Error", "Data transaksi atau pengaturan tidak tersedia untuk membuat PDF");
      return;
    }
    await handleThermalPDF(); // Directly call the PDF generation
  };

  const handleThermalPrint = async () => {
    if (!savedTransaction || !thermalSettings) return;
    
    setPrintLoading(true);
    try {
      const result = await ThermalPrintService.printReceipt({
        transaction: savedTransaction,
        settings: thermalSettings,
      });
      
      if (result.success) {
        Alert.alert("Berhasil", result.message, [
          { text: "OK", onPress: () => {
            setShowThermalPreview(false);
            router.back();
          }}
        ]);
      } else {
        Alert.alert("Error", result.message || "Gagal mencetak struk");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui";
      Alert.alert("Error", `Gagal mencetak struk: ${message}`);
    } finally {
      setPrintLoading(false);
    }
  };

  const handleThermalPDF = async () => {
    if (!savedTransaction || !thermalSettings) return;
    
    setPrintLoading(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Struk_${savedTransaction.customer_name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
      
      const result = await ThermalPrintService.generateAndSharePDF({
        transaction: savedTransaction,
        settings: thermalSettings,
        filename,
      });
      
      if (result.success) {
        Alert.alert("Berhasil", result.message, [
          { text: "OK", onPress: () => {
            setShowThermalPreview(false);
            router.back();
          }}
        ]);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch {
      Alert.alert("Error", "Gagal membuat PDF");
    } finally {
      setPrintLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    // Reset form for new transaction
    setFormData({
      jenis_barang: "",
      bruto_kg: "",
      tare_kg: "",
      netto_kg: 0,
      pot_percentage: "0",
      pot_kg: "0",
      harga_per_kg: "",
      total_kg: 0,
      total_harga: 0,
      admin_name: formData.admin_name, // Keep admin name
      customer_name: "",
      catatan: "",
    });
    router.back();
  };

  const resetForm = () => {
    Alert.alert(
      "Reset Form",
      "Apakah Anda yakin ingin mereset form?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setFormData({
              jenis_barang: "",
              bruto_kg: "",
              tare_kg: "",
              netto_kg: 0,
              pot_percentage: "0",
              pot_kg: "0",
              harga_per_kg: "",
              total_kg: 0,
              total_harga: 0,
              admin_name: formData.admin_name, // Keep admin name
              customer_name: "",
              catatan: "",
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              <Pressable onPress={() => router.back()}>
                <ArrowLeft size={24} color="#374151" />
              </Pressable>
              <Text className="text-xl font-bold text-gray-900">Transaksi Baru</Text>
            </View>
            <Pressable onPress={resetForm}>
              <Text className="text-sm text-blue-600 font-medium">Reset</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Calculation Summary Card */}
          <View className="mx-6 mt-6 mb-6">
            <View className="bg-blue-600 rounded-2xl p-6 relative overflow-hidden">
              <View className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
              
              <Text className="text-sm text-blue-100 mb-2">Total Transaksi</Text>
              <Text className="text-3xl font-bold text-white mb-4">
                {formatCurrency(formData.total_harga)}
              </Text>
              
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-blue-200">Total Berat</Text>
                  <Text className="text-lg font-semibold text-white">
                    {formatNumber(formData.total_kg)} Kg
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-blue-200">Netto</Text>
                  <Text className="text-lg font-semibold text-white">
                    {formatNumber(formData.netto_kg)} Kg
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View className="mx-6 space-y-6">
            {/* Data Barang Section */}
            <View className="bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row items-center mb-4">
                <Package size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Data Barang</Text>
              </View>
              
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Jenis Barang *</Text>
                  <TextInput
                    value={formData.jenis_barang}
                    onChangeText={(value) => setFormData(prev => ({ ...prev, jenis_barang: value }))}
                    placeholder="Contoh: Kelapa Sawit, Karet"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>

            {/* Data Timbangan Section */}
            <View className="bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row items-center mb-4">
                <Calculator size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Data Timbangan</Text>
              </View>
              
              <View className="space-y-4">
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Bruto (Kg) *</Text>
                    <TextInput
                      value={formData.bruto_kg}
                      onChangeText={(value) => setFormData(prev => ({ ...prev, bruto_kg: value }))}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Tare (Kg) *</Text>
                    <TextInput
                      value={formData.tare_kg}
                      onChangeText={(value) => setFormData(prev => ({ ...prev, tare_kg: value }))}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                {/* Auto calculated Netto */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Netto (Otomatis)</Text>
                  <View className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
                    <Text className="text-gray-700 font-medium">
                      {formatNumber(formData.netto_kg)} Kg
                    </Text>
                  </View>
                </View>

                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Pot (%)</Text>
                    <TextInput
                      value={formData.pot_percentage}
                      onChangeText={(value) => setFormData(prev => ({ ...prev, pot_percentage: value }))}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Pot (Kg)</Text>
                    <TextInput
                      value={formData.pot_kg}
                      onChangeText={(value) => setFormData(prev => ({ ...prev, pot_kg: value }))}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                {/* Auto calculated Total */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Total (Otomatis)</Text>
                  <View className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
                    <Text className="text-gray-700 font-medium">
                      {formatNumber(formData.total_kg)} Kg
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Data Harga Section */}
            <View className="bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row items-center mb-4">
                <Text className="text-lg font-semibold text-gray-900">💰 Data Harga</Text>
              </View>
              
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Harga per Kg *</Text>
                  <TextInput
                    value={formData.harga_per_kg}
                    onChangeText={(value) => setFormData(prev => ({ ...prev, harga_per_kg: value }))}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {/* Auto calculated Total Harga */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Total Harga (Otomatis)</Text>
                  <View className="w-full px-4 py-3 border border-blue-200 rounded-xl bg-blue-50">
                    <Text className="text-blue-700 font-bold text-lg">
                      {formatCurrency(formData.total_harga)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Data Admin & Customer Section */}
            <View className="bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row items-center mb-4">
                <UserCheck size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Data Admin & Customer</Text>
              </View>
              
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Admin *</Text>
                  <TextInput
                    value={formData.admin_name}
                    onChangeText={(value) => setFormData(prev => ({ ...prev, admin_name: value }))}
                    placeholder="Nama admin"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Customer/Sopir *</Text>
                  <TextInput
                    value={formData.customer_name}
                    onChangeText={(value) => setFormData(prev => ({ ...prev, customer_name: value }))}
                    placeholder="Nama customer atau sopir"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>

            {/* Catatan Section */}
            <View className="bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row items-center mb-4">
                <FileText size={20} color="#2563eb" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Catatan</Text>
              </View>
              
              <TextInput
                value={formData.catatan}
                onChangeText={(value) => setFormData(prev => ({ ...prev, catatan: value }))}
                placeholder="Catatan tambahan (opsional)"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View className="px-6 py-4 bg-white border-t border-gray-200">
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className={`w-full py-4 rounded-2xl items-center justify-center flex-row ${
              loading ? "bg-gray-300" : "bg-blue-600"
            }`}
          >
            <Save size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white font-semibold text-lg">
              {loading ? "Menyimpan..." : "Simpan Transaksi"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
          }}>
            {/* Success Icon */}
            <View style={{
              width: 80,
              height: 80,
              backgroundColor: '#dcfce7',
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <CheckCircle size={40} color="#16a34a" />
            </View>

            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#111827',
              textAlign: 'center',
              marginBottom: 8,
            }}>
              Transaksi Berhasil Disimpan!
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: '#16a34a',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {formatCurrency(formData.total_harga)}
            </Text>

            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 20,
            }}>
              Customer: {formData.customer_name}\n{formData.jenis_barang} • {formatNumber(formData.total_kg)} Kg
            </Text>

            {/* Action Buttons */}
                      <View style={{ width: '100%', gap: 12 }}>
                        <Pressable
                          onPress={handlePrint}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 12,
                            paddingHorizontal: 20,
                            backgroundColor: '#16a34a',
                            borderRadius: 12,
                          }}
                        >
                          <Printer size={18} color="white" style={{ marginRight: 8 }} />
                          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Cetak Struk</Text>
                        </Pressable>
            
                        <Pressable
                          onPress={handleSendPDF}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 12,
                            paddingHorizontal: 20,
                            backgroundColor: '#2563eb',
                            borderRadius: 12,
                          }}
                        >
                          <Send size={18} color="white" style={{ marginRight: 8 }} />
                          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Kirim PDF</Text>
                        </Pressable>
            
                        <Pressable
                          onPress={handleCloseSuccess}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 12,
                            paddingHorizontal: 20,
                            backgroundColor: '#f3f4f6',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                          }}
                        >
                          <X size={18} color="#6b7280" style={{ marginRight: 8 }} />
                          <Text style={{ color: '#6b7280', fontWeight: '600', fontSize: 16 }}>Tutup</Text>
                        </Pressable>            </View>
          </View>
        </View>
      </Modal>

      {/* Thermal Receipt Preview */}
      {savedTransaction && thermalSettings && (
        <ThermalReceiptPreview
          visible={showThermalPreview}
          onClose={() => setShowThermalPreview(false)}
          transaction={savedTransaction}
          settings={thermalSettings}
          onPrint={handleThermalPrint}
          loading={printLoading}
        />
      )}
    </SafeAreaView>
  );
}
