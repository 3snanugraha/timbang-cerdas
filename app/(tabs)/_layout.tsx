import { Tabs } from "expo-router";
import { BarChart3, History, Plus, Settings, User } from "lucide-react-native";
import { View, Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb", // Blue-600
        tabBarInactiveTintColor: "#9ca3af", // Gray-400
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 70,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? '#2563eb' : 'transparent',
            }}>
              <BarChart3 size={focused ? 20 : size} color={focused ? "white" : color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Riwayat",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? '#2563eb' : 'transparent',
            }}>
              <History size={focused ? 20 : size} color={focused ? "white" : color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? '#1d4ed8' : '#2563eb',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
              <Plus size={28} color="white" strokeWidth={3} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Pengaturan",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? '#2563eb' : 'transparent',
            }}>
              <Settings size={focused ? 20 : size} color={focused ? "white" : color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? '#2563eb' : 'transparent',
            }}>
              <User size={focused ? 20 : size} color={focused ? "white" : color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
