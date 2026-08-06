import { useState } from "react";
import {
  useRequestResetCodeMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
  useLoginMutation,
} from "../../service/auth/mutations";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

export type ForgotPasswordStep = "EMAIL" | "CODE" | "NEW_PASSWORD";

export const useForgotPassword = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState<ForgotPasswordStep>("EMAIL");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const requestMutation = useRequestResetCodeMutation();
  const verifyMutation = useVerifyResetCodeMutation();
  const resetMutation = useResetPasswordMutation();

  const handleRequestCode = () => {
    setErrorMsg(null);
    if (!email.trim()) {
      setErrorMsg(t("auth.emailRequired") || "Email is required");
      return;
    }

    requestMutation.mutate(email, {
      onSuccess: () => {
        setStep("CODE");
        setSuccessMsg(t("auth.codeSent") || "Reset code sent to your email");
      },
      onError: (err: any) => {
        setErrorMsg(
          err?.response?.data?.message || err.message || "Failed to send code",
        );
      },
    });
  };

  const handleVerifyCode = () => {
    setErrorMsg(null);
    if (!code.trim()) {
      setErrorMsg(t("auth.codeRequired") || "Verification code is required");
      return;
    }

    verifyMutation.mutate(
      { email, code },
      {
        onSuccess: () => {
          setStep("NEW_PASSWORD");
          setSuccessMsg(
            t("auth.codeVerified") ||
              "Code verified. You can now set a new password.",
          );
        },
        onError: (err: any) => {
          setErrorMsg(
            err?.response?.data?.message ||
              err.message ||
              "Invalid or expired code",
          );
        },
      },
    );
  };

    const loginMutation = useLoginMutation();

  const handleResetPassword = () => {
    setErrorMsg(null);
    if (!newPassword.trim() || newPassword.length < 6) {
      setErrorMsg(
        t("auth.passwordMinLength") || "Password must be at least 6 characters",
      );
      return;
    }

    resetMutation.mutate(
      { email, newPassword },
      {
        onSuccess: () => {
          setSuccessMsg(
            t("auth.passwordResetSuccess") || "Password successfully reset! Logging you in...",
          );
          
          // Auto login after password reset
          loginMutation.mutate({ email, password: newPassword }, {
              onSuccess: () => {
                setTimeout(() => {
                    router.replace("/(tab)/CarScreen");
                }, 1000);
              },
              onError: () => {
                  // Fallback to login screen if auto-login fails
                  setTimeout(() => {
                      router.replace("/LoginUpScreen");
                  }, 1500);
              }
          });
        },
        onError: (err: any) => {
          setErrorMsg(
            err?.response?.data?.message ||
              err.message ||
              "Failed to reset password",
          );
        },
      },
    );
  };

  return {
    step,
    setStep,
    email,
    setEmail,
    code,
    setCode,
    newPassword,
    setNewPassword,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    handleRequestCode,
    handleVerifyCode,
    handleResetPassword,
    isRequesting: requestMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isResetting: resetMutation.isPending,
  };
};
