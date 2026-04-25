import API from "./api";
import { VerificationPayload } from "../types/screens/verification";
import API_URL from "../constant/URL";
import { useAuthStore } from "../store/authStore";

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

        const token = useAuthStore.getState().token;
        const response = await fetch(`${API_URL}/api/verification/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        if (!response.ok) {
            let errorMsg = "Verification failed";
            try {
                const errData = await response.json();
                errorMsg = errData.message || errorMsg;
            } catch (e) {}
            throw new Error(errorMsg);
        }
        return await response.json();
    },
};
