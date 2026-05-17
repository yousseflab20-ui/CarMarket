import api from "../api";
import type { Report ,UpdateReport} from "../../types/Reports/ReportType";

export const getReport = async (): Promise<Report[]> => {
    const response = await api.get("/report/get");
    return response.data.reports;
}

export const updateReport = async (selectedReport: UpdateReport) => {
    try {
        const response = await api.put(`/report/update/${selectedReport.id}`,{ status: selectedReport.status });
    return response.data;
    } catch (error) {
        throw new Error("Failed to update report", { cause: error });
    }
}