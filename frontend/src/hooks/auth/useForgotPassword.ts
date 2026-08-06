import { useState, useEffect } from "react";
import {
  useRequestResetCodeMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
  useLoginMutation,
} from "../../service/auth/mutations";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

export type ForgotPasswordStep = "EMAIL" | "CODE" | "NEW_PASSWORD";

const RESEND_COOLDOWN = 120; // 2 minutes in seconds

export const useForgotPassword = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState<ForgotPasswordStep>("EMAIL");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend timer state
  const [resendSeconds, setResendSeconds] = useState(0);
  const canResend = resendSeconds <= 0;

  const requestMutation = useRequestResetCodeMutation();
  const verifyMutation = useVerifyResetCodeMutation();
  const resetMutation = useResetPasswordMutation();
  const loginMutation = useLoginMutation();

  // Countdown timer — runs only when resendSeconds > 0
  useEffect(() => {
    if (resendSeconds <= 0) return;

    const interval = setInterval(() => {
      setResendSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendSeconds]);

  const startResendTimer = () => {
    setResendSeconds(RESEND_COOLDOWN);
  };

  // Format seconds to MM:SS
  const formattedTimer = `${Math.floor(resendSeconds / 60)}:${String(resendSeconds % 60).padStart(2, "0")}`;

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
        startResendTimer(); // ← start timer after code is sent
      },
      onError: (err: any) => {
        setErrorMsg(
          err?.response?.data?.message || err.message || "Failed to send code",
        );
      },
    });
  };

  const handleResendCode = () => {
    if (!canResend) return;
    setErrorMsg(null);
    setCode("");

    requestMutation.mutate(email, {
      onSuccess: () => {
        setSuccessMsg(t("auth.codeSent") || "New code sent to your email");
        startResendTimer(); // ← reset timer on each resend
      },
      onError: (err: any) => {
        setErrorMsg(
          err?.response?.data?.message || err.message || "Failed to resend code",
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
            },
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
    handleResendCode,
    handleVerifyCode,
    handleResetPassword,
    isRequesting: requestMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isResetting: resetMutation.isPending,
    canResend,
    resendSeconds,
    formattedTimer,
  };
};
