import { Colors } from "@/theme";
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import { Tabs } from "expo-router";

interface TabButtonProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: ((e: GestureResponderEvent) => void) | null;
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  accessibilityLabel?: string;
  testID?: string;
}
import {
  FileText,
  Grid3x3,
  Home,
  User,
  Wallet,
} from "lucide-react-native";
import { StyleSheet, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabIcon({ icon, focused }: { icon: React.ReactNode; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      {icon}
    </View>
  );
}

function NoRippleTabButton({ children, style, onPress, onLongPress, accessibilityState, accessibilityLabel, testID }: TabButtonProps) {
  return (
    <Pressable
      android_ripple={null}
      style={[{ flex: 1 }, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </Pressable>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(242,245,251,0.97)",
          borderTopWidth: 1,
          borderTopColor: "rgba(24,120,206,0.08)",
          height: 64 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.light,
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
        },
        tabBarLabel: ({ focused, color, children }) => (
          <Text style={{
            fontSize: 11,
            fontFamily: focused ? "Urbanist_600SemiBold" : "Urbanist_500Medium",
            color,
            marginTop: 2,
          }}>
            {children}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarItemStyle: {
          borderRadius: 12,
        },
        tabBarButton: (props) => <NoRippleTabButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} icon={<Home size={24} color={color} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} icon={<Wallet size={24} color={color} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} icon={<Grid3x3 size={24} color={color} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} icon={<FileText size={24} color={color} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} icon={<User size={24} color={color} />} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  iconWrapActive: {
    backgroundColor: "rgba(24,120,206,0.1)",
  },
});
