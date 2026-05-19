import api from "../api";
import type { Report, UpdateReport } from "../../types/Reports/ReportType";

export const getReport = async (): Promise<Report[]> => {
    const response = await api.get("/report/get");
    return response.data.reports;
}

export const updateReport = async (selectedReport: UpdateReport) => {
    try {
        const payload: any = { status: selectedReport.status };
        if (selectedReport.adminMessage !== undefined) {
            payload.adminMessage = selectedReport.adminMessage;
        }
        console.log("🔥 [FRONTEND] Sending updateReport payload:", payload);
        const response = await api.put(`/report/update/${selectedReport.id}`, payload);
        return response.data;
    } catch (error) {
        throw new Error("Failed to update report", { cause: error });
    }
}

export const deletReport = async (id: string) => {
    try {
        const response = await api.delete(`/report/delete/${id}`);
        return response.data;
    } catch (error) {
        throw new Error("Failed to delete report", { cause: error });
    }
}