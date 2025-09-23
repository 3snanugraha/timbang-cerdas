import { Link, router } from "expo-router";
import { Lock, LogIn, User } from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { LoginFormData } from "../../types";
import AuthService from "../../services/AuthService";
import { ValidationUtils } from "../../utils/validation";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validate username
    const usernameValidation = ValidationUtils.validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      Alert.alert("Error", usernameValidation.message!);
      return;
    }

    // Validate password
    const passwordValidation = ValidationUtils.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      Alert.alert("Error", passwordValidation.message!);
      return;
    }

    setLoading(true);
    
    try {
      const result = await AuthService.login({
        username: formData.username.trim(),
        password: formData.password,
      });

      if (result.success) {
        Alert.alert(
          "Berhasil", 
          result.message || "Login berhasil!",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)")
            }
          ]
        );
      } else {
        Alert.alert("Error", result.message || "Login gagal");
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert("Error", "Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Logo Section */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 mb-6">
              <Image 
                source={require("../../assets/images/logo.png")}
                className="w-full h-full rounded-full"
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</Text>
            <Text className="text-gray-500">Masuk ke akun Timbang Cerdas Anda</Text>
          </View>

          {/* Form Section */}
          <View className="mb-8">
            {/* Username Field */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Username</Text>
              <View className="relative">
                <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <User size={20} color="#9ca3af" />
                </View>
                <TextInput
                  value={formData.username}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, username: value }))}
                  placeholder="Masukkan username"
                  autoCapitalize="none"
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl text-gray-900 bg-white"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-8">
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <View className="relative">
                <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <Lock size={20} color="#9ca3af" />
                </View>
                <TextInput
                  value={formData.password}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, password: value }))}
                  placeholder="Masukkan password"
                  secureTextEntry
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl text-gray-900 bg-white"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className={`w-full py-4 rounded-2xl items-center justify-center flex-row ${
                loading ? "bg-gray-300" : "bg-blue-600"
              }`}
            >
              <LogIn size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white font-semibold text-lg">
                {loading ? "Memproses..." : "Masuk"}
              </Text>
            </Pressable>
          </View>

          {/* Register Link */}
          <View className="items-center">
            <Text className="text-gray-600">
              Belum punya akun?{" "}
              <Link href="/(auth)/register" className="text-blue-600 font-semibold">
                Daftar sekarang
              </Link>
            </Text>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
