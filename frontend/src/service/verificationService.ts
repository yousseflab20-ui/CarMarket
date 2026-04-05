import API from "./api";
import { VerificationPayload } from "../types/screens/verification";

export const verificationService = {
    submitVerification: async (data: VerificationPayload) => {

        const formData = new FormData();
        formData.append("fullName", data.fullName);
        formData.append("phone", data.phone);
        formData.append("city", data.city);
        formData.append("bio", data.bio);

        if (data.selfieUri) {
            const uriParts = data.selfieUri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append("selfie", {
                uri: data.selfieUri,
                name: `selfie.${fileType}`,
                type: `image/${fileType}`,
            } as any);
        }

        const response = await API.post("/verification", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
};
