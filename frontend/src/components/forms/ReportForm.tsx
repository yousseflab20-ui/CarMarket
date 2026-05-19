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

function ReasonChip({ label, selected, hasError, onPress }: ReasonChipProps) {
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
      if (label === "Scam") return { border: "border-red-500/40 bg-red-950/10", text: "text-white" };
      if (label === "Fake listing") return { border: "border-amber-500/40 bg-amber-950/10", text: "text-white" };
      if (label === "Other") return { border: "border-blue-500/40 bg-blue-950/10", text: "text-white" };
      return { border: "border-indigo-500/40 bg-indigo-950/10", text: "text-white" };
    }
    if (hasError) return { border: "border-red-500/30 bg-[#1C1F26]", text: "text-slate-400" };
    return { border: "border-slate-800/80 bg-[#1C1F26]", text: "text-slate-400" };
  };

  const styles = getStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={[
        "flex-row items-center justify-between rounded-xl border-[1.5px] p-4",
        styles.border,
      ].join(" ")}
    >
      <View className="flex-row items-center gap-3">
        <View className={[
          "p-2 rounded-lg",
          selected 
            ? label === "Scam" ? "bg-red-500/10" 
              : label === "Fake listing" ? "bg-amber-500/10" 
              : label === "Other" ? "bg-blue-500/10" 
              : "bg-indigo-500/10"
            : "bg-slate-800/50"
        ].join(" ")}>
          {getIcon()}
        </View>
        <Text
          className={[
            "text-base font-semibold",
            styles.text,
          ].join(" ")}
        >
          {label}
        </Text>
      </View>

      <View
        className={[
          "h-[20px] w-[20px] items-center justify-center rounded-full border-2",
          selected 
            ? label === "Scam" ? "border-red-500" 
              : label === "Fake listing" ? "border-amber-500" 
              : label === "Other" ? "border-blue-500" 
              : "border-indigo-500"
            : "border-slate-700",
        ].join(" ")}
      >
        {selected && (
          <View className={[
            "h-2.5 w-2.5 rounded-full",
            label === "Scam" ? "bg-red-500" 
              : label === "Fake listing" ? "bg-amber-500" 
              : label === "Other" ? "bg-blue-500" 
              : "bg-indigo-500"
          ].join(" ")} />
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
      className="flex-1 bg-[#0B0E14]" 
      style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 16 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />


      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-12 pt-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Banner */}
        <View className="mb-6 flex-row gap-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-4">
          <ShieldCheck size={22} color="#818CF8" style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-white">Safe Community Guarantee</Text>
            <Text className="text-xs text-slate-400 mt-1 leading-[18px]">
              We take all reports seriously. Our trust and safety team will review this report within 24 hours to keep CarMarket safe.
            </Text>
          </View>
        </View>

        {/* Reasons Section */}
        <View className="mb-6">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Select a Reason <Text className="text-red-500">*</Text>
          </Text>

          <View className="gap-2.5">
            {REASONS.map((reason) => (
              <ReasonChip
                key={reason}
                label={reason}
                selected={selectedReason === reason}
                hasError={reasonError}
                onPress={() => {
                  setSelectedReason(reason);
                  setReasonError(false);
                }}
              />
            ))}
          </View>

          {reasonError && (
            <Text className="mt-2 text-xs text-red-500">
              Please select a reason before submitting.
            </Text>
          )}
        </View>

        {/* Details Section */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Additional Details
            </Text>
            <Text className="text-[11px] font-medium text-slate-600">
              Optional
            </Text>
          </View>

          <TextInput
            className={[
              "min-h-[120px] rounded-xl border-[1.5px] bg-[#1C1F26] px-4 py-3.5 text-[15px] leading-relaxed text-slate-200",
              focused ? "border-indigo-500" : "border-slate-800/80",
            ].join(" ")}
            placeholder="Tell us more about the issue (e.g. suspicious activity, false info)..."
            placeholderTextColor="#64748B"
            value={message}
            onChangeText={setMessage}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={500}
          />

          <Text className="mt-2 text-right text-xs text-slate-500 font-medium">
            {message.length}/500
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={loading}
          className={[
            "flex-row items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 shadow-lg shadow-indigo-500/20",
            loading ? "opacity-60" : "",
          ].join(" ")}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Send size={18} color="#fff" />
              <Text className="text-base font-bold tracking-wide text-white">
                Submit Report
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text className="mt-4 text-center text-xs leading-[18px] text-slate-500 font-medium">
          By submitting this report, you confirm the details are accurate.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
