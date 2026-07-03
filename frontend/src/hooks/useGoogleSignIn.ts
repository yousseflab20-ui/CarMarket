import { useEffect, useState } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useGoogleLoginMutation } from "../service/auth/mutations";
import { AuthStatus } from "../types/screens/auth";
import { useTranslation } from "react-i18next";

export const useGoogleSignIn = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [signupStatus, setSignupStatus] = useState<AuthStatus | null>(null);
  const googleMutation = useGoogleLoginMutation();
  const { t } = useTranslation();

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setSignupStatus(null);
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      await GoogleSignin.signOut().catch(() => undefined);
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (idToken) {
        googleMutation.mutate(idToken, {
          onSuccess: () => {
            setSignupStatus({
              status: "success",
              title: t("auth.loginSuccess"),
            });
          },
          onError: (error: any) => {
            const errorMsg =
              error?.response?.data?.message ||
              (error instanceof Error ? error.message : t("auth.somethingWentWrong"));
            setSignupStatus({
              status: "error",
              title: errorMsg,
            });
          },
        });
        return;
      }

      setSignupStatus({
        status: "error",
        title: t("auth.somethingWentWrong"),
      });
    } catch (error) {
      console.log("Erreur Google:", error);
      setSignupStatus({
        status: "error",
        title: t("auth.somethingWentWrong"),
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isGooglePending = isGoogleLoading || googleMutation.isPending;

  return {
    handleGoogleSignIn,
    isGooglePending,
    signupStatus,
    setSignupStatus,
  };
};
