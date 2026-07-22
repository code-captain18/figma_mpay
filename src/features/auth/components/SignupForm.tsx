import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Lock } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GradientButton } from "@/components/ui/GradientButton";
import { OrbitalMark } from "@/components/svg/OrbitalMark";
import { signupSchema, type SignupFormValues } from "@/features/auth/schemas/auth.schema";
import { Colors } from "@/theme/colors";
import { shadowStyle } from "@/theme/shadows";

interface SignupFormProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export function SignupForm({ onSuccess, onNavigateLogin }: SignupFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (_values: SignupFormValues) => {
    onSuccess();
  };

  const fields: Array<{
    name: keyof SignupFormValues;
    label: string;
    placeholder: string;
    keyboard: "default" | "phone-pad" | "email-address" | "number-pad";
    secure?: boolean;
    maxLength?: number;
  }> = [
    { name: "fullName", label: "Full Name", placeholder: "John Mensah", keyboard: "default" },
    { name: "phone", label: "Phone Number", placeholder: "0241234567", keyboard: "phone-pad" },
    { name: "email", label: "Email Address", placeholder: "you@email.com", keyboard: "email-address" },
    { name: "pin", label: "Create PIN", placeholder: "••••", keyboard: "number-pad", secure: true, maxLength: 4 },
  ];

  return (
    <>
      <LinearGradient
        colors={[Colors.sky, Colors.blue, Colors.deep]}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        className="min-h-[200px] items-center justify-end overflow-hidden pb-10"
      >
        <View
          className="absolute -right-10 -top-10 h-[180px] w-[180px] rounded-full bg-white/10"
        />
        <View className="items-center gap-3">
          <OrbitalMark size={56} />
          <Text
            className="text-[20px] font-extrabold text-white"
            style={{ fontFamily: "Urbanist_800ExtraBold" }}
          >
            Create Account
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 -mt-5 rounded-t-3xl bg-mpay-bg"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 28,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          className="mb-5 flex-row items-center gap-1"
          onPress={onNavigateLogin}
          accessibilityRole="button"
          accessibilityLabel="Back to login"
        >
          <ChevronLeft size={15} color={Colors.blue} />
          <Text className="text-xs font-bold" style={{ color: Colors.blue }}>
            Back to Login
          </Text>
        </TouchableOpacity>

        {fields.map((field) => (
          <View key={field.name} className="mb-4">
            <Text className="mb-1.5 text-xs font-bold" style={{ color: Colors.mid }}>
              {field.label}
            </Text>
            <Controller
              control={control}
              name={field.name}
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  className="h-[52px] flex-row items-center rounded-2xl bg-white px-4"
                  style={{
                    gap: 12,
                    borderWidth: 1.5,
                    borderColor: errors[field.name] ? Colors.red : Colors.border,
                    ...shadowStyle(),
                  }}
                >
                  {field.secure && <Lock size={16} color={Colors.light} />}
                  <TextInput
                    className="flex-1 text-sm"
                    style={{ color: Colors.navy }}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.pale}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType={field.keyboard}
                    autoCapitalize="none"
                    secureTextEntry={field.secure}
                    maxLength={field.maxLength}
                    accessibilityLabel={field.label}
                  />
                </View>
              )}
            />
            {errors[field.name] && (
              <Text className="mt-1 text-[11px]" style={{ color: Colors.red }}>
                {errors[field.name]?.message}
              </Text>
            )}
          </View>
        ))}

        <GradientButton
          label={isSubmitting ? "Creating account…" : "Create Account"}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />

        <View className="mt-5 flex-row justify-center">
          <Text className="text-xs" style={{ color: Colors.light }}>
            {"Already have an account? "}
          </Text>
          <TouchableOpacity
            onPress={onNavigateLogin}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <Text className="text-xs font-bold" style={{ color: Colors.blue }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
