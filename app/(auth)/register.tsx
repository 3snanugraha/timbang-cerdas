import { Link, router } from "expo-router";
import { Lock, Mail, User, UserPlus } from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthService from "../../services/AuthService";
import type { RegisterFormData } from "../../types";
import { ValidationUtils } from "../../utils/validation";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validate full name
    const fullNameValidation = ValidationUtils.validateFullName(formData.full_name);
    if (!fullNameValidation.isValid) {
      Alert.alert("Error", fullNameValidation.message!);
      return;
    }

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

    // Validate confirm password
    const confirmPasswordValidation = ValidationUtils.validateConfirmPassword(formData.password, formData.confirmPassword);
    if (!confirmPasswordValidation.isValid) {
      Alert.alert("Error", confirmPasswordValidation.message!);
      return;
    }

    setLoading(true);
    
    try {
      const result = await AuthService.register({
        username: formData.username.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
      });

      if (result.success) {
        Alert.alert(
          "Berhasil", 
          result.message || "Akun berhasil dibuat!",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)")
            }
          ]
        );
      } else {
        Alert.alert("Error", result.message || "Pendaftaran gagal");
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert("Error", "Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
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
        <ScrollView 
          className="flex-1 px-6" 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View className="items-center mb-10">
            <View className="w-24 h-24 mb-6">
              <Image 
                source={require("../../assets/images/logo.png")}
                className="w-full h-full rounded-full"
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Daftar</Text>
            <Text className="text-gray-500 text-center">Buat akun Timbang Cerdas baru</Text>
          </View>

          {/* Form Section */}
          <View className="mb-8">
            {/* Full Name Field */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Nama Lengkap</Text>
              <View className="relative">
                <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <Mail size={20} color="#9ca3af" />
                </View>
                <TextInput
                  value={formData.full_name}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, full_name: value }))}
                  placeholder="Masukkan nama lengkap"
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl text-gray-900 bg-white"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

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
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <View className="relative">
                <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <Lock size={20} color="#9ca3af" />
                </View>
                <TextInput
                  value={formData.password}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, password: value }))}
                  placeholder="Masukkan password (min. 6 karakter)"
                  secureTextEntry
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl text-gray-900 bg-white"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Confirm Password Field */}
            <View className="mb-8">
              <Text className="text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</Text>
              <View className="relative">
                <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <Lock size={20} color="#9ca3af" />
                </View>
                <TextInput
                  value={formData.confirmPassword}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
                  placeholder="Masukkan ulang password"
                  secureTextEntry
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl text-gray-900 bg-white"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Register Button */}
            <Pressable
              onPress={handleRegister}
              disabled={loading}
              className={`w-full py-4 rounded-2xl items-center justify-center flex-row ${
                loading ? "bg-gray-300" : "bg-blue-600"
              }`}
            >
              <UserPlus size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white font-semibold text-lg">
                {loading ? "Memproses..." : "Daftar"}
              </Text>
            </Pressable>
          </View>

          {/* Login Link */}
          <View className="items-center mb-8">
            <Text className="text-gray-600">
              Sudah punya akun?{" "}
              <Link href="/(auth)/login" className="text-blue-600 font-semibold">
                Masuk sekarang
              </Link>
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="items-center pb-6">
          <Text className="text-xs text-gray-400">
            4SEKAWAN
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
