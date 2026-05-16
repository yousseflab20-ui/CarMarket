import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Reason, ReportPayload, REASONS, ReasonChipProps } from "../../types/report/formReport";
import { createReport } from "../../service/report/endpointReport";
import { queryClient } from "@/src/lib/react-query";
import { useStackedToastStore } from "@/src/store/stackedToastStore";

function ReasonChip({ label, selected, hasError, onPress }: ReasonChipProps) {

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className={[
        "flex-row items-center gap-3 rounded-xl border-[1.5px] px-4 py-[14px]",
        selected
          ? "border-indigo-500 bg-indigo-950"
          : hasError
            ? "border-red-500/30 bg-slate-800"
            : "border-slate-700 bg-slate-800",
      ].join(" ")}
    >
      <View
        className={[
          "h-[18px] w-[18px] items-center justify-center rounded-full border-2",
          selected ? "border-indigo-500" : "border-slate-600",
        ].join(" ")}
      >
        {selected && (
          <View className="h-2 w-2 rounded-full bg-indigo-500" />
        )}
      </View>

      {/* Label */}
      <Text
        className={[
          "text-[15px]",
          selected ? "font-semibold text-white" : "font-medium text-slate-200",
        ].join(" ")}
      >
        {label}
      </Text>
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
      addToast({ title: 'Report submitted', description: "Thank you for letting us know", type: 'success' });
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
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-12 pt-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8">
          <Text className="mb-1.5 text-2xl font-bold tracking-tight text-white">
            Report
          </Text>
          <Text className="text-sm leading-5 text-slate-400">
            Help us keep the platform safe and trustworthy.
          </Text>
        </View>

        <View className="mb-7">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Reason <Text className="text-red-500">*</Text>
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
              Please select a reason.
            </Text>
          )}
        </View>

        <View className="mb-7">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Message{" "}
            <Text className="text-[13px] font-normal normal-case tracking-normal text-slate-500">
              (optional)
            </Text>
          </Text>

          <TextInput
            className={[
              "min-h-[120px] rounded-xl border-[1.5px] bg-slate-800 px-4 py-3.5 text-[15px] leading-relaxed text-slate-200",
              focused ? "border-indigo-500" : "border-slate-700",
            ].join(" ")}
            placeholder="Add any additional details…"
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

          <Text className="mt-1.5 text-right text-xs text-slate-500">
            {message.length}/500
          </Text>
        </View>

        <View className="mb-7 h-px bg-slate-700/60" />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={loading}
          className={[
            "items-center justify-center rounded-2xl bg-indigo-600 py-4",
            loading ? "opacity-60" : "",
          ].join(" ")}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-base font-bold tracking-wide text-white">
              Submit Report
            </Text>
          )}
        </TouchableOpacity>

        <Text className="mt-4 text-center text-xs leading-[18px] text-slate-500">
          Reports are reviewed by our trust &amp; safety team.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function addToast(arg0: { title: string; description: string; type: string; }) {
  throw new Error("Function not implemented.");
}
