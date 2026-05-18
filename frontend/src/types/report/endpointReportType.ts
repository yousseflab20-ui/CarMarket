export interface CreateReportRequest {
    targetType: "USER" | "CAR" | "POST";
    reason: string;
    targetId:number;
    message:string
}
