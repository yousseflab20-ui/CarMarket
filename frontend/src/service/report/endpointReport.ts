import API from "../api";
import { CreateReportRequest } from "@/src/types/report/endpointReportType";

export const createReport = async (reportData: CreateReportRequest) => {
    try {
        const response = await API.post(`report/create`, reportData);
        return response.data;
    } catch (error) {
        throw error;
    }
    
}