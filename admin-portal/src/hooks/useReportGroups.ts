import { useMemo } from "react";
import type { Report, ReportGroup } from "../types/Reports/ReportType";

export const useReportGroups = (reports: Report[]): ReportGroup[] => {
  return useMemo(() => {
    const groupMap = new Map<string, ReportGroup>();

    reports.forEach((report) => {
      const key = `${report.targetType}_${report.targetId}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          targetId: report.targetId,
          targetType: report.targetType,
          targetData: report.targetData,
          reports: [],
          groupStatus: report.status,
          latestAt: report.createdAt,
        });
      }

      const group = groupMap.get(key)!;
      group.reports.push(report);

      if (new Date(report.createdAt) > new Date(group.latestAt)) {
        group.latestAt = report.createdAt;
      }

      if (report.status === "PENDING") {
        group.groupStatus = "PENDING";
      }
    });

    return Array.from(groupMap.values()).sort((a, b) => {
      if (b.reports.length !== a.reports.length) {
        return b.reports.length - a.reports.length;
      }
      return new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime();
    });
  }, [reports]);
};
