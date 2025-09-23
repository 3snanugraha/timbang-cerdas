import { Text, View, ScrollView, Pressable, RefreshControl, Alert } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Package,
  Plus,
  Clock,
  ArrowUpRight
} from "lucide-react-native";
import { router } from "expo-router";
import AuthService from "../../services/AuthService";
import DatabaseService, { Transaction } from "../../services/DatabaseService";

interface DashboardStats {
  todayTransactions: number;
  todayRevenue: number;
  weekTransactions: number;
  weekRevenue: number;
  monthTransactions: number;
  monthRevenue: number;
}


export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayTransactions: 0,
    todayRevenue: 0,
    weekTransactions: 0,
    weekRevenue: 0,
    monthTransactions: 0,
    monthRevenue: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser) {
        Alert.alert("Error", "Session expired. Please login again.");
        router.replace("/(auth)/login");
        return;
      }

      // Update user name from current session
      setUserName(currentUser.full_name);

      // Get user statistics from database
      const userStats = await DatabaseService.getUserStats(currentUser.id);
      setStats({
        todayTransactions: userStats.todayTransactions,
        todayRevenue: userStats.todayRevenue,
        weekTransactions: userStats.weekTransactions,
        weekRevenue: userStats.weekRevenue,
        monthTransactions: userStats.monthTransactions,
        monthRevenue: userStats.monthRevenue,
      });

      // Get recent transactions (limit to 5 for dashboard)
      const transactions = await DatabaseService.getUserTransactions(currentUser.id, 5);
      setRecentTransactions(transactions);
      
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      Alert.alert("Error", "Gagal memuat data dashboard. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const formatDateLong = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const handleNewTransaction = () => {
    router.push("/(tabs)/transaction");
  };

  const handleViewHistory = () => {
    router.push("/(tabs)/history");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6 bg-white">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center">
                <BarChart3 size={24} color="white" strokeWidth={2.5} />
              </View>
              <View>
                <Text className="text-xs text-gray-500">Selamat datang!</Text>
                <Text className="text-lg font-bold text-gray-900">{userName}</Text>
              </View>
            </View>
            <Pressable 
              onPress={handleNewTransaction}
              className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center"
            >
              <Plus size={20} color="#2563eb" strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        {/* Today's Summary Card */}
        <View className="mx-6 mb-8">
          <View 
            style={{
              backgroundColor: '#2563eb',
              borderRadius: 20,
              padding: 24,
              position: 'relative',
              overflow: 'hidden',
              elevation: 8,
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            {/* Decorative elements */}
            <View 
              style={{
                position: 'absolute',
                right: -16,
                top: -16,
                width: 80,
                height: 80,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 40,
              }} 
            />
            <View 
              style={{
                position: 'absolute',
                right: -32,
                top: -32,
                width: 64,
                height: 64,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 32,
              }} 
            />
            
            <Text style={{ fontSize: 14, color: '#bfdbfe', marginBottom: 4 }}>
              Transaksi Hari Ini
            </Text>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
              {loading ? '...' : stats.todayTransactions} Transaksi
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 12, color: '#bfdbfe', marginBottom: 4 }}>
                  Total Pendapatan
                </Text>
                <Text style={{ fontSize: 20, fontWeight: '600', color: 'white' }}>
                  {loading ? '...' : formatCurrency(stats.todayRevenue)}
                </Text>
              </View>
              
              <Pressable 
                onPress={handleViewHistory}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', marginRight: 8 }}>
                  Lihat Detail
                </Text>
                <ArrowUpRight size={16} color="white" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="mx-6 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">Ringkasan</Text>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Week Stats */}
            <View style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#f3f4f6',
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#dcfce7',
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TrendingUp size={16} color="#16a34a" />
                </View>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>Minggu Ini</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                {loading ? '...' : stats.weekTransactions} Transaksi
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {loading ? '...' : formatCurrency(stats.weekRevenue)}
              </Text>
            </View>

            {/* Month Stats */}
            <View style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#f3f4f6',
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#fed7aa',
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Calendar size={16} color="#ea580c" />
                </View>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>Bulan Ini</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                {loading ? '...' : stats.monthTransactions} Transaksi
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {loading ? '...' : formatCurrency(stats.monthRevenue)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-6 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</Text>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable 
              onPress={handleNewTransaction}
              style={{
                flex: 1,
                backgroundColor: '#eff6ff',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#dbeafe',
              }}
            >
              <View style={{
                width: 32,
                height: 32,
                backgroundColor: '#2563eb',
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Plus size={16} color="white" />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e3a8a', marginBottom: 4 }}>
                Transaksi Baru
              </Text>
              <Text style={{ fontSize: 12, color: '#2563eb' }}>
                Buat transaksi timbangan
              </Text>
            </Pressable>

            <Pressable 
              onPress={handleViewHistory}
              style={{
                flex: 1,
                backgroundColor: '#f0fdf4',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#dcfce7',
              }}
            >
              <View style={{
                width: 32,
                height: 32,
                backgroundColor: '#16a34a',
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <BarChart3 size={16} color="white" />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#14532d', marginBottom: 4 }}>
                Lihat Riwayat
              </Text>
              <Text style={{ fontSize: 12, color: '#16a34a' }}>
                Riwayat transaksi
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="mx-6 mb-8">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text className="text-lg font-bold text-gray-900">Transaksi Terbaru</Text>
            <Pressable onPress={handleViewHistory}>
              <Text style={{ fontSize: 14, color: '#2563eb', fontWeight: '500' }}>Lihat Semua</Text>
            </Pressable>
          </View>
          
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#f3f4f6',
            overflow: 'hidden',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          }}>
            {loading ? (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Text style={{ color: '#6b7280', fontSize: 14 }}>Memuat data...</Text>
              </View>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <View key={transaction.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      backgroundColor: '#fed7aa',
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Package size={18} color="#ea580c" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '500', color: '#111827', marginBottom: 4, fontSize: 15 }}>
                        {transaction.customer_name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Text style={{ fontSize: 12, color: '#6b7280', marginRight: 8 }}>
                          {transaction.jenis_barang}
                        </Text>
                        <View style={{ width: 2, height: 2, backgroundColor: '#d1d5db', borderRadius: 1, marginRight: 8 }} />
                        <Text style={{ fontSize: 12, color: '#6b7280', marginRight: 8 }}>
                          {formatDateLong(transaction.transaction_date)}
                        </Text>
                        <View style={{ width: 2, height: 2, backgroundColor: '#d1d5db', borderRadius: 1, marginRight: 8 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Clock size={10} color="#9ca3af" />
                          <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                            {formatDate(transaction.created_at)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontWeight: '600', color: '#111827', fontSize: 15 }}>
                        {formatCurrency(transaction.total_harga)}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        {transaction.total_kg} kg
                      </Text>
                    </View>
                  </View>
                  {index < recentTransactions.length - 1 && (
                    <View style={{ height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 }} />
                  )}
                </View>
              ))
            ) : (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  backgroundColor: '#f3f4f6',
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Package size={20} color="#9ca3af" />
                </View>
                <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', marginBottom: 4 }}>
                  Belum ada transaksi
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center' }}>
                  Buat transaksi pertama Anda
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom spacing for tab bar */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
