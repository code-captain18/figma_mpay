import { Tabs } from "expo-router";
import {
  FileText,
  Grid3x3,
  Home,
  User,
  Wallet,
} from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { Colors } from "@/theme/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(242,245,251,0.97)",
          borderTopWidth: 1,
          borderTopColor: "rgba(24,120,206,0.08)",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.light,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "700",
          fontFamily: "Urbanist_700Bold",
        },
        tabBarItemStyle: {
          borderRadius: 12,
        },
        tabBarActiveBackgroundColor: "rgba(24,120,206,0.08)",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ color, size }) => <Grid3x3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
