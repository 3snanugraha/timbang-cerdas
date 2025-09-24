import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useFocusEffect } from "@react-navigation/native";
import * as Print from 'expo-print';
import { router } from "expo-router";
import {
  Calendar,
  Clock,
  DollarSign,
  Download,
  Filter,
  MoreVertical,
  Package,
  Printer,
  Search,
  Send,
  X
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as Sharing from 'expo-sharing';
import { generateTransactionExportHTML } from '../../components/export/TransactionExportTemplate';
import { ThermalPrintService, ThermalReceiptPreview, type ThermalSettings } from '../../components/thermal';
import AuthService from "../../services/AuthService";
import DatabaseService, { Transaction } from "../../services/DatabaseService";

// Using Transaction interface from DatabaseService

interface FilterOptions {
  dateRange: 'today' | 'week' | 'month' | 'all';
  jenisBarang: string;
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest';
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState<Date | null>(null);
  const [exportEndDate, setExportEndDate] = useState<Date | null>(null);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showThermalPreview, setShowThermalPreview] = useState(false);
  const [thermalSettings, setThermalSettings] = useState<ThermalSettings | null>(null);
  const [printLoading, setPrintLoading] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    jenisBarang: '',
    sortBy: 'newest'
  });

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser) {
        Alert.alert("Error", "Session expired. Please login again.");
        router.replace("/(auth)/login");
        return;
      }

      // Load all user transactions from database
      const userTransactions = await DatabaseService.getUserTransactions(currentUser.id);
      setTransactions(userTransactions);
      setFilteredTransactions(userTransactions);
      
      // Load company settings for thermal printing
      try {
        const companySettings = await DatabaseService.getCompanySettings(currentUser.id);
        if (companySettings) {
          setThermalSettings({
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
          });
        }
      } catch (error) {
        console.error('Failed to load company settings:', error);
      }
      
      console.log('Transactions loaded successfully:', userTransactions.length);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      Alert.alert("Error", "Gagal memuat data transaksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const filterAndSortTransactions = useCallback(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.customer_name.toLowerCase().includes(query) ||
        transaction.jenis_barang.toLowerCase().includes(query) ||
        transaction.admin_name.toLowerCase().includes(query)
      );
    }

    // Date range filter
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(t => t.transaction_date === todayStr);
        break;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => new Date(t.transaction_date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => new Date(t.transaction_date) >= monthAgo);
        break;
    }

    // Jenis barang filter
    if (filters.jenisBarang.trim()) {
      filtered = filtered.filter(t => 
        t.jenis_barang.toLowerCase().includes(filters.jenisBarang.toLowerCase())
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.total_harga - a.total_harga);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.total_harga - b.total_harga);
        break;
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, filters]);

  useEffect(() => {
    filterAndSortTransactions();
  }, [filterAndSortTransactions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTransactions();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short", 
      year: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowActionModal(true);
  };

  // const handleEdit = () => {
  //   if (selectedTransaction) {
  //     setShowActionModal(false);
  //     // TODO: Navigate to edit transaction page
  //     Alert.alert("Info", "Fitur edit akan diimplementasikan");
  //   }
  // };

  // const handleDelete = () => {
  //   if (selectedTransaction) {
  //     Alert.alert(
  //       "Hapus Transaksi",
  //       `Apakah Anda yakin ingin menghapus transaksi ${selectedTransaction.customer_name}?`,
  //       [
  //         { text: "Batal", style: "cancel" },
  //         {
  //           text: "Hapus",
  //           style: "destructive",
  //           onPress: async () => {
  //             try {
  //               const currentUser = AuthService.getCurrentUser();
  //               if (!currentUser) {
  //                 Alert.alert("Error", "Session expired");
  //                 return;
  //               }
                
  //               // Delete transaction from database
  //               await DatabaseService.deleteTransaction(selectedTransaction.id, currentUser.id);
                
  //               // Update local state
  //               setTransactions(prev => prev.filter(t => t.id !== selectedTransaction.id));
  //               setShowActionModal(false);
  //               Alert.alert("Berhasil", "Transaksi berhasil dihapus");
  //             } catch (error) {
  //               console.error('Delete transaction error:', error);
  //               Alert.alert("Error", "Gagal menghapus transaksi");
  //             }
  //           }
  //         }
  //       ]
  //     );
  //   }
  // };

  const handlePrint = () => {
    if (selectedTransaction && thermalSettings) {
      setShowActionModal(false);
      setShowThermalPreview(true);
    } else {
      Alert.alert("Error", "Data transaksi atau pengaturan tidak tersedia untuk dicetak");
    }
  };

  const handleSendPDF = async () => {
    if (!selectedTransaction || !thermalSettings) {
      Alert.alert("Error", "Data transaksi atau pengaturan tidak tersedia untuk membuat PDF");
      return;
    }
    setShowActionModal(false);
    await handleThermalPDF(); // Directly call the PDF generation
  };

  const handleThermalPrint = async () => {
    if (!selectedTransaction || !thermalSettings) return;
    
    setPrintLoading(true);
    try {
      const result = await ThermalPrintService.printReceipt({
        transaction: selectedTransaction,
        settings: thermalSettings,
      });
      
      if (result.success) {
        Alert.alert("Berhasil", result.message, [
          { text: "OK", onPress: () => setShowThermalPreview(false) }
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
    if (!selectedTransaction || !thermalSettings) return;
    
    setPrintLoading(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Struk_${selectedTransaction.customer_name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
      
      const result = await ThermalPrintService.generateAndSharePDF({
        transaction: selectedTransaction,
        settings: thermalSettings,
        filename,
      });
      
      if (result.success) {
        Alert.alert("Berhasil", result.message, [
          { text: "OK", onPress: () => setShowThermalPreview(false) }
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

  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      jenisBarang: '',
      sortBy: 'newest'
    });
    setShowFilterModal(false);
  };

  const handleExport = async () => {
    if (!exportStartDate || !exportEndDate) {
      Alert.alert("Error", "Silakan pilih rentang tanggal.");
      return;
    }

    if (exportStartDate > exportEndDate) {
      Alert.alert("Error", "Tanggal mulai tidak boleh lebih besar dari tanggal selesai.");
      return;
    }

    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        Alert.alert("Error", "Sesi berakhir. Silakan login kembali.");
        router.replace("/(auth)/login");
        return;
      }

      const startDateString = exportStartDate.toISOString().split('T')[0];
      const endDateString = exportEndDate.toISOString().split('T')[0];

      const transactionsToExport = await DatabaseService.getTransactionsByDateRange(
        currentUser.id,
        startDateString,
        endDateString
      );

      if (transactionsToExport.length === 0) {
        Alert.alert("Info", "Tidak ada transaksi untuk diekspor pada rentang tanggal yang dipilih.");
        return;
      }

      const html = generateTransactionExportHTML(transactionsToExport, startDateString, endDateString);
      const { uri } = await Print.printToFileAsync({ html });

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Export Laporan Transaksi',
      });

      setShowExportModal(false);

    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Gagal mengekspor data.");
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange !== 'all') count++;
    if (filters.jenisBarang.trim()) count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Memuat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={{
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
          Riwayat Transaksi
        </Text>
        
        {/* Search and Filter */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, position: 'relative' }}>
            <View style={{
              position: 'absolute',
              left: 12,
              top: 12,
              zIndex: 10,
            }}>
              <Search size={20} color="#9ca3af" />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari customer atau barang..."
              style={{
                width: '100%',
                paddingLeft: 44,
                paddingRight: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 12,
                color: '#111827',
                backgroundColor: 'white',
                fontSize: 14,
              }}
              placeholderTextColor="#9ca3af"
            />
          </View>
          
          <Pressable
            onPress={() => setShowFilterModal(true)}
            style={{
              width: 48,
              height: 48,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              position: 'relative',
            }}
          >
            <Filter size={20} color="#374151" />
            {getActiveFilterCount() > 0 && (
              <View style={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 20,
                height: 20,
                backgroundColor: '#2563eb',
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 10, color: 'white', fontWeight: '600' }}>
                  {getActiveFilterCount()}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => setShowExportModal(true)}
            style={{
              width: 48,
              height: 48,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
            }}
          >
            <Download size={20} color="#374151" />
          </Pressable>
        </View>

        {/* Statistics */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{
            flex: 1,
            backgroundColor: '#eff6ff',
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: '#dbeafe',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Package size={14} color="#2563eb" />
              <Text style={{ fontSize: 12, color: '#2563eb', marginLeft: 4, fontWeight: '500' }}>
                Total Transaksi
              </Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1d4ed8' }}>
              {loading ? '...' : filteredTransactions.length.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: '#f0fdf4',
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: '#dcfce7',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <DollarSign size={14} color="#16a34a" />
              <Text style={{ fontSize: 12, color: '#16a34a', marginLeft: 4, fontWeight: '500' }}>
                Total Pendapatan
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#15803d' }}>
              {loading ? '...' : formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.total_harga, 0))}
            </Text>
          </View>
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ color: '#6b7280', fontSize: 16 }}>Memuat data transaksi...</Text>
          </View>
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction, index) => (
            <Pressable
              key={transaction.id}
              onPress={() => handleTransactionPress(transaction)}
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#f3f4f6',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ fontWeight: 'bold', color: '#111827', fontSize: 17, marginBottom: 4 }}>
                    {transaction.customer_name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                    <Package size={14} color="#6b7280" />
                    <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 4, marginRight: 8 }}>
                      {transaction.jenis_barang}
                    </Text>
                    <View style={{ width: 2, height: 2, backgroundColor: '#d1d5db', borderRadius: 1, marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: '#6b7280', marginRight: 8 }}>
                      {transaction.total_kg.toLocaleString("id-ID")} Kg
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Calendar size={14} color="#6b7280" />
                    <Text style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4, marginRight: 8 }}>
                      {formatDate(transaction.transaction_date)}
                    </Text>
                    <View style={{ width: 2, height: 2, backgroundColor: '#d1d5db', borderRadius: 1, marginRight: 8 }} />
                    <Clock size={12} color="#6b7280" />
                    <Text style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>
                      {formatTime(transaction.created_at)}
                    </Text>
                  </View>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: 'bold', color: '#111827', fontSize: 17, marginBottom: 4 }}>
                    {formatCurrency(transaction.total_harga)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#6b7280', marginRight: 4 }}>
                      {formatCurrency(transaction.harga_per_kg)}/kg
                    </Text>
                    <MoreVertical size={14} color="#9ca3af" />
                  </View>
                </View>
              </View>

              {/* Enhanced Progress Bar */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: 8,
                padding: 8,
                marginBottom: 8,
              }}>
                <Text style={{ fontSize: 12, color: '#64748b', marginRight: 8, minWidth: 60 }}>
                  Bruto: {transaction.bruto_kg} kg
                </Text>
                <View style={{ flex: 1, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, marginHorizontal: 8 }}>
                  <View 
                    style={{
                      height: 4,
                      backgroundColor: '#3b82f6',
                      borderRadius: 2,
                      width: `${Math.min(100, (transaction.total_kg / transaction.bruto_kg) * 100)}%`,
                    }}
                  />
                </View>
                <Text style={{ fontSize: 12, color: '#64748b', marginLeft: 8, minWidth: 60, textAlign: 'right' }}>
                  Netto: {transaction.total_kg} kg
                </Text>
              </View>

              {transaction.catatan && (
                <View style={{
                  backgroundColor: '#fef3c7',
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginTop: 4,
                }}>
                  <Text style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
                    Catatan: {transaction.catatan}
                  </Text>
                </View>
              )}
            </Pressable>
          ))
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 }}>
            <View style={{
              width: 64,
              height: 64,
              backgroundColor: '#f3f4f6',
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Package size={28} color="#9ca3af" />
            </View>
            <Text style={{ color: '#6b7280', fontSize: 18, fontWeight: '500', marginBottom: 8, textAlign: 'center' }}>
              Tidak ada transaksi
            </Text>
            <Text style={{ color: '#9ca3af', textAlign: 'center', fontSize: 14, lineHeight: 20, paddingHorizontal: 32 }}>
              {searchQuery || getActiveFilterCount() > 0 
                ? "Coba ubah kata kunci pencarian atau filter Anda"
                : "Belum ada transaksi yang tersimpan. Buat transaksi pertama Anda."
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-3/4">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Filter & Urutkan</Text>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <X size={24} color="#374151" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Date Range */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-3">Rentang Waktu</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'Semua' },
                    { key: 'today', label: 'Hari Ini' },
                    { key: 'week', label: 'Minggu Ini' },
                    { key: 'month', label: 'Bulan Ini' },
                  ].map((option) => (
                    <Pressable
                      key={option.key}
                      onPress={() => setFilters(prev => ({ ...prev, dateRange: option.key as any }))}
                      className={`px-4 py-2 rounded-lg border ${
                        filters.dateRange === option.key
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text className={`text-sm font-medium ${
                        filters.dateRange === option.key
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}>
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Sort By */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-3">Urutkan Berdasarkan</Text>
                <View className="space-y-2">
                  {[
                    { key: 'newest', label: 'Terbaru' },
                    { key: 'oldest', label: 'Terlama' },
                    { key: 'highest', label: 'Nilai Tertinggi' },
                    { key: 'lowest', label: 'Nilai Terendah' },
                  ].map((option) => (
                    <Pressable
                      key={option.key}
                      onPress={() => setFilters(prev => ({ ...prev, sortBy: option.key as any }))}
                      className={`px-4 py-3 rounded-lg border ${
                        filters.sortBy === option.key
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text className={`text-sm font-medium ${
                        filters.sortBy === option.key
                          ? 'text-blue-700'
                          : 'text-gray-700'
                      }`}>
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <Pressable
                  onPress={resetFilters}
                  className="flex-1 py-3 rounded-lg border border-gray-300 items-center"
                >
                  <Text className="text-gray-700 font-medium">Reset</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowFilterModal(false)}
                  className="flex-1 py-3 rounded-lg bg-blue-600 items-center"
                >
                  <Text className="text-white font-medium">Terapkan</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            {selectedTransaction && (
              <>
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  {selectedTransaction.customer_name}
                </Text>
                <Text className="text-sm text-gray-600 mb-4">
                  {selectedTransaction.jenis_barang} • {formatDate(selectedTransaction.transaction_date)}
                </Text>
                <Text className="text-xl font-bold text-blue-600 mb-6">
                  {formatCurrency(selectedTransaction.total_harga)}
                </Text>

                <View className="space-y-3">
                  {/* <Pressable
                    onPress={handleEdit}
                    className="flex-row items-center py-3 px-4 rounded-lg bg-blue-50"
                  >
                    <Edit3 size={20} color="#2563eb" />
                    <Text className="text-blue-700 font-medium ml-3">Edit Transaksi</Text>
                  </Pressable> */}

                  <Pressable
                    onPress={handlePrint}
                    className="flex-row items-center py-3 px-4 rounded-lg bg-green-50"
                  >
                    <Printer size={20} color="#16a34a" />
                    <Text className="text-green-700 font-medium ml-3">Cetak Ulang</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSendPDF}
                    className="flex-row items-center py-3 px-4 rounded-lg bg-blue-50"
                  >
                    <Send size={20} color="#2563eb" />
                    <Text className="text-blue-700 font-medium ml-3">Kirim PDF</Text>
                  </Pressable>

                  {/* <Pressable
                    onPress={handleDelete}
                    className="flex-row items-center py-3 px-4 rounded-lg bg-red-50"
                  >
                    <Trash2 size={20} color="#dc2626" />
                    <Text className="text-red-700 font-medium ml-3">Hapus Transaksi</Text>
                  </Pressable> */}
                </View>

                <Pressable
                  onPress={() => setShowActionModal(false)}
                  className="mt-6 py-3 px-4 rounded-lg border border-gray-200 items-center"
                >
                  <Text className="text-gray-700 font-medium">Tutup</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Thermal Receipt Preview */}
      {selectedTransaction && thermalSettings && (
        <ThermalReceiptPreview
          visible={showThermalPreview}
          onClose={() => setShowThermalPreview(false)}
          transaction={selectedTransaction}
          settings={thermalSettings}
          onPrint={handleThermalPrint}
          loading={printLoading}
        />
      )}

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Export Transaksi</Text>
              <Pressable onPress={() => setShowExportModal(false)}>
                <X size={24} color="#374151" />
              </Pressable>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">Pilih Rentang Waktu</Text>
              <View className="flex-row space-x-3">
                <Pressable onPress={() => setShowStartDatePicker(true)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-white">
                  <Text className="text-gray-900">{exportStartDate ? exportStartDate.toLocaleDateString('id-ID') : "Tanggal Mulai"}</Text>
                </Pressable>
                <Pressable onPress={() => setShowEndDatePicker(true)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-white">
                  <Text className="text-gray-900">{exportEndDate ? exportEndDate.toLocaleDateString('id-ID') : "Tanggal Selesai"}</Text>
                </Pressable>
              </View>
              {showStartDatePicker && (
                <DateTimePicker
                  value={exportStartDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                    setShowStartDatePicker(false);
                    if (selectedDate) {
                      setExportStartDate(selectedDate);
                    }
                  }}
                />
              )}
              {showEndDatePicker && (
                <DateTimePicker
                  value={exportEndDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                    setShowEndDatePicker(false);
                    if (selectedDate) {
                      setExportEndDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            <View className="flex-row space-x-3">
              <Pressable
                onPress={() => setShowExportModal(false)}
                className="flex-1 py-3 rounded-lg border border-gray-300 items-center"
              >
                <Text className="text-gray-700 font-medium">Batal</Text>
              </Pressable>
              <Pressable
                onPress={handleExport}
                className="flex-1 py-3 rounded-lg bg-blue-600 items-center"
              >
                <Text className="text-white font-medium">Export</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
