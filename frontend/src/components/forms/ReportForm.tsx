import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle, 
  HelpCircle, 
  ArrowLeft, 
  Send,
  ShieldCheck
} from "lucide-react-native";
import { Reason, ReportPayload, REASONS, ReasonChipProps } from "../../types/report/formReport";
import { useStackedToastStore } from "@/src/store/stackedToastStore";
import { useAppTheme } from "../../hooks/useAppTheme";

interface ExtendedReasonChipProps extends ReasonChipProps {
  isDark: boolean;
}

function ReasonChip({ label, selected, hasError, onPress, isDark }: ExtendedReasonChipProps) {
  const getIcon = () => {
    switch (label) {
      case "Spam":
        return <AlertTriangle size={18} color={selected ? "#6366F1" : "#94A3B8"} />;
      case "Scam":
        return <ShieldAlert size={18} color={selected ? "#EF4444" : "#94A3B8"} />;
      case "Fake listing":
        return <AlertCircle size={18} color={selected ? "#F59E0B" : "#94A3B8"} />;
      case "Other":
        return <HelpCircle size={18} color={selected ? "#3B82F6" : "#94A3B8"} />;
    }
  };

  const getStyles = () => {
    if (selected) {
      if (label === "Scam") return { 
        borderColor: isDark ? "rgba(239, 68, 68, 0.4)" : "rgba(239, 68, 68, 0.5)", 
        backgroundColor: isDark ? "rgba(127, 29, 29, 0.2)" : "rgba(254, 226, 226, 0.8)", 
        textColor: isDark ? "#FFFFFF" : "#991B1B" 
      };
      if (label === "Fake listing") return { 
        borderColor: isDark ? "rgba(245, 158, 11, 0.4)" : "rgba(245, 158, 11, 0.5)", 
        backgroundColor: isDark ? "rgba(120, 53, 15, 0.2)" : "rgba(254, 243, 199, 0.8)", 
        textColor: isDark ? "#FFFFFF" : "#92400E" 
      };
      if (label === "Other") return { 
        borderColor: isDark ? "rgba(59, 130, 246, 0.4)" : "rgba(59, 130, 246, 0.5)", 
        backgroundColor: isDark ? "rgba(30, 58, 138, 0.2)" : "rgba(219, 234, 254, 0.8)", 
        textColor: isDark ? "#FFFFFF" : "#1E40AF" 
      };
      return { 
        borderColor: isDark ? "rgba(99, 102, 241, 0.4)" : "rgba(99, 102, 241, 0.5)", 
        backgroundColor: isDark ? "rgba(49, 46, 129, 0.2)" : "rgba(224, 231, 255, 0.8)", 
        textColor: isDark ? "#FFFFFF" : "#3730A3" 
      };
    }
    
    if (hasError) return { 
        borderColor: isDark ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.5)", 
        backgroundColor: isDark ? "#1C1F26" : "#FFFFFF", 
        textColor: isDark ? "#94A3B8" : "#475569" 
    };
    
    return { 
        borderColor: isDark ? "rgba(30, 41, 59, 0.8)" : "rgba(226, 232, 240, 1)", 
        backgroundColor: isDark ? "#1C1F26" : "#FFFFFF", 
        textColor: isDark ? "#94A3B8" : "#475569" 
    };
  };

  const getIconBg = () => {
    if (selected) {
      if (label === "Scam") return isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.15)";
      if (label === "Fake listing") return isDark ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.15)";
      if (label === "Other") return isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.15)";
      return isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.15)";
    }
    return isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(241, 245, 249, 1)";
  };

  const styles = getStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 12,
        borderWidth: 1.5,
        padding: 16,
        borderColor: styles.borderColor,
        backgroundColor: styles.backgroundColor,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ padding: 8, borderRadius: 8, backgroundColor: getIconBg() }}>
          {getIcon()}
        </View>
        <Text style={{ fontSize: 16, fontWeight: "600", color: styles.textColor }}>
          {label}
        </Text>
      </View>

      <View
        style={{
          height: 20, width: 20,
          alignItems: "center", justifyContent: "center",
          borderRadius: 10,
          borderWidth: 2,
          borderColor: selected 
            ? label === "Scam" ? "#EF4444" 
              : label === "Fake listing" ? "#F59E0B" 
              : label === "Other" ? "#3B82F6" 
              : "#6366F1"
            : isDark ? "#334155" : "#CBD5E1",
        }}
      >
        {selected && (
          <View style={{
            height: 10, width: 10, borderRadius: 5,
            backgroundColor: label === "Scam" ? "#EF4444" 
              : label === "Fake listing" ? "#F59E0B" 
              : label === "Other" ? "#3B82F6" 
              : "#6366F1"
          }} />
        )}
      </View>
    </TouchableOpacity>
  );
}

interface ReportFormProps {
  onSubmit: (data: ReportPayload) => Promise<void>;
}

export default function ReportForm({ onSubmit }: ReportFormProps) {
  const [selectedReason, setSelectedReason] = useState<Reason | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [reasonError, setReasonError] = useState(false);
  const [focused, setFocused] = useState(false);
  const addToast = useStackedToastStore(state => state.addToast);
  const { isDark } = useAppTheme();

  const C = {
    bg: isDark ? "#09090B" : "#F8FAFC",
    surface: isDark ? "#1C1F26" : "#FFFFFF",
    border: isDark ? "rgba(30, 41, 59, 0.8)" : "rgba(226, 232, 240, 1)",
    text: isDark ? "#E2E8F0" : "#1E293B",
    muted: isDark ? "#94A3B8" : "#64748B",
    header: isDark ? "#FFFFFF" : "#0F172A",
    bannerBg: isDark ? "rgba(49, 46, 129, 0.1)" : "rgba(224, 231, 255, 0.8)",
    bannerBorder: isDark ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.3)",
    bannerText: isDark ? "#FFFFFF" : "#312E81",
    bannerSub: isDark ? "#94A3B8" : "#4F46E5",
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      setReasonError(true);
      return;
    }
    setReasonError(false);
    setLoading(true);

    const payload: ReportPayload = {
      reason: selectedReason,
      message: message.trim(),
    };

    try {
      await onSubmit(payload);
      addToast({ 
        title: 'Report submitted', 
        description: "Thank you for helping us keep the platform safe.", 
        type: 'success' 
      });
      setSelectedReason(null);
      setMessage("");
    } catch (error: any) {
      addToast({
        title: "Report failed",
        description:
          error?.response?.data?.message ||
          "Something went wrong",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 16 }}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={C.bg} />

      {/* Modern Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingBottom: 16 }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: C.header, marginLeft: 16 }}>Report Issue</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48, paddingTop: 8 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Banner */}
        <View style={{ marginBottom: 24, flexDirection: "row", gap: 14, borderRadius: 12, borderWidth: 1, borderColor: C.bannerBorder, backgroundColor: C.bannerBg, padding: 16 }}>
          <ShieldCheck size={22} color="#818CF8" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: C.bannerText }}>Safe Community Guarantee</Text>
            <Text style={{ fontSize: 12, color: C.bannerSub, marginTop: 4, lineHeight: 18 }}>
              We take all reports seriously. Our trust and safety team will review this report within 24 hours to keep CarMarket safe.
            </Text>
          </View>
        </View>

        {/* Reasons Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ marginBottom: 12, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, color: C.muted }}>
            Select a Reason <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>

          <View style={{ gap: 10 }}>
            {REASONS.map((reason) => (
              <ReasonChip
                key={reason}
                label={reason}
                selected={selectedReason === reason}
                hasError={reasonError}
                isDark={isDark}
                onPress={() => {
                  setSelectedReason(reason);
                  setReasonError(false);
                }}
              />
            ))}
          </View>

          {reasonError && (
            <Text style={{ marginTop: 8, fontSize: 12, color: "#EF4444" }}>
              Please select a reason before submitting.
            </Text>
          )}
        </View>

        {/* Details Section */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, color: C.muted }}>
              Additional Details
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "500", color: C.muted }}>
              Optional
            </Text>
          </View>

          <TextInput
            style={{
              minHeight: 120,
              borderRadius: 12,
              borderWidth: 1.5,
              backgroundColor: C.surface,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 15,
              lineHeight: 24,
              color: C.text,
              borderColor: focused ? "#6366F1" : C.border,
            }}
            placeholder="Tell us more about the issue (e.g. suspicious activity, false info)..."
            placeholderTextColor={C.muted}
            value={message}
            onChangeText={setMessage}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={500}
          />

          <Text style={{ marginTop: 8, textAlign: "right", fontSize: 12, color: C.muted, fontWeight: "500" }}>
            {message.length}/500
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={loading}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 12,
            backgroundColor: "#4F46E5",
            paddingVertical: 16,
            opacity: loading ? 0.6 : 1,
            shadowColor: "#4F46E5",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Send size={18} color="#fff" />
              <Text style={{ fontSize: 16, fontWeight: "bold", letterSpacing: 0.5, color: "#fff" }}>
                Submit Report
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={{ marginTop: 16, textAlign: "center", fontSize: 12, lineHeight: 18, color: C.muted, fontWeight: "500" }}>
          By submitting this report, you confirm the details are accurate.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
