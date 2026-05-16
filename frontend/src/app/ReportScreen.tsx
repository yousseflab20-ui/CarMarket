import React from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ReportForm from "../components/forms/ReportForm";
import { router } from "expo-router";
import {createReport} from "../service/report/endpointReport";
import { ReportTargetType } from "../types/report/formReport";
export default function ReportScreen() {
  const { targetId, targetType } = useLocalSearchParams();

  const handleSubmit = async (data: any) => {
    try {
      await createReport({
        targetId: Number(targetId),
        targetType: targetType as ReportTargetType,
        reason: data.reason,
        message: data.message,
      });

      router.back();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ReportForm onSubmit={handleSubmit} />
    </View>
  );
}