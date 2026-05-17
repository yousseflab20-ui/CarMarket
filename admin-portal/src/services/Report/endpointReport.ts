import api from "../api";
import type { Report } from "../../types/Reports/ReportType";

export const getReport = async (): Promise<Report[]> => {
    const response = await api.get("/report/get");
    return response.data.reports;
}