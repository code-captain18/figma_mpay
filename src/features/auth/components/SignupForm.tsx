import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Lock } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { OrbitalMark } from "@/components/svg/OrbitalMark";
import { signupSchema, type SignupFormValues } from "@/features/auth/schemas/auth.schema";
import { Colors, Radius, Shadows, Spacing, T } from "@/theme";

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
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={sStyles.header}
      >
        <View style={sStyles.headerOrb} />
        <View style={{ alignItems: "center", gap: 12 }}>
          <OrbitalMark size={56} />
          <Text style={sStyles.headerTitle}>Create Account</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={sStyles.scrollArea}
        contentContainerStyle={sStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={sStyles.backRow}
          onPress={onNavigateLogin}
          accessibilityRole="button"
          accessibilityLabel="Back to login"
        >
          <ChevronLeft size={15} color={Colors.primary} />
          <Text style={sStyles.backText}>Back to Login</Text>
        </TouchableOpacity>

        {fields.map((field) => (
          <View key={field.name} style={sStyles.fieldGroup}>
            <Text style={sStyles.fieldLabel}>{field.label}</Text>
            <Controller
              control={control}
              name={field.name}
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[sStyles.inputRow, {
                    borderColor: errors[field.name] ? Colors.borderError : Colors.border,
                  }]}
                >
                  {field.secure && <Lock size={16} color={Colors.textLight} />}
                  <TextInput
                    style={sStyles.textInput}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.textDisabled}
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
              <Text style={sStyles.errorText}>{errors[field.name]?.message}</Text>
            )}
          </View>
        ))}

        <Button
          label={isSubmitting ? "Creating account…" : "Create Account"}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />

        <View style={sStyles.signInRow}>
          <Text style={sStyles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={onNavigateLogin} accessibilityRole="button" accessibilityLabel="Sign in">
            <Text style={sStyles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const sStyles = StyleSheet.create({
  header: {
    minHeight: 200,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
    paddingBottom: Spacing["3xl"],
  },
  headerOrb: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    ...T.headingLG,
    color: "#fff",
    fontFamily: "Urbanist_800ExtraBold",
  },
  scrollArea: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: Radius["3xl"],
    borderTopRightRadius: Radius["3xl"],
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing["3xl"],
    paddingBottom: Spacing["4xl"],
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.xl,
  },
  backText: { ...T.bodySM, fontFamily: "Urbanist_700Bold", color: Colors.primary },
  fieldGroup: { marginBottom: Spacing.lg },
  fieldLabel: { ...T.label, color: Colors.textMuted, marginBottom: Spacing.sm },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1.5,
    ...Shadows.subtle,
  },
  textInput: { flex: 1, ...T.bodyMD, color: Colors.textPrimary },
  errorText: { ...T.caption, color: Colors.error, marginTop: 4 },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  signInText: { ...T.bodySM, color: Colors.textLight },
  signInLink: { ...T.bodySM, fontFamily: "Urbanist_700Bold", color: Colors.primary },
});
