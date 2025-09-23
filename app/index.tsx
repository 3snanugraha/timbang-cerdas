import { Text, View, ActivityIndicator, Image } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DatabaseService from "../services/DatabaseService";
import AuthService from "../services/AuthService";

export default function Index() {
  useEffect(() => {
    // Initialize app: check database, user session, etc.
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing app...');
      
      // Initialize SQLite database
      await DatabaseService.init();
      console.log('Database initialized');
      
      // Initialize AuthService and check for existing session
      await AuthService.initialize();
      console.log('AuthService initialized');
      
      // Small delay for smooth UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user is logged in
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        console.log('User is logged in:', currentUser.username);
        router.replace("/(tabs)");
      } else {
        console.log('No user session found, redirecting to login');
        router.replace("/(auth)/login");
      }
    } catch (error) {
      console.error("App initialization error:", error);
      // On any error, redirect to login
      router.replace("/(auth)/login");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-8">
        {/* Logo */}
        <View className="w-32 h-32 mb-8">
          <Image 
            source={require("../assets/images/logo.png")}
            className="w-full h-full rounded-full"
            resizeMode="contain"
          />
        </View>
        
        {/* App Name */}
        <Text className="text-4xl font-bold text-blue-600 mb-3 text-center">
          Timbang Cerdas
        </Text>
        <Text className="text-base text-gray-600 mb-12 text-center leading-6">
          Sistem Timbangan Digital Cerdas{"\n"}
          RAM SEKAWAN JAYA SEJAHTERA
        </Text>
        
        {/* Loading Indicator */}
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-4 text-center">Menginisialisasi aplikasi...</Text>
      </View>
    </SafeAreaView>
  );
}
