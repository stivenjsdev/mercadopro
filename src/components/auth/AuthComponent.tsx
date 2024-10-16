"use client";

import LoginForm from "@/components/auth/LoginForm";
import UserContent from "@/components/auth/UserContent";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fetchUserInfo, refreshToken } from "@/services/auth/mercadolibreAuth";
import { UserInfo } from "@/types/mercadolibreResponses";
import { TokenData } from "@/types/tokenData";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const AuthComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthentication = async () => {
      // Verificar si hay un token en la URL
      const tokenFromUrl = searchParams.get("token");
      if (tokenFromUrl) {
        try {
          const tokenData: TokenData = JSON.parse(atob(tokenFromUrl));
          localStorage.setItem(
            "MERCADOLIBRE_TOKEN_DATA",
            JSON.stringify({
              ...tokenData,
              expires_at: Date.now() + tokenData.expires_in * 1000,
            })
          );
          router.replace("/");
        } catch (error) {
          console.error("Error parsing token data:", error);
          toast({
            title: "Error de autenticación",
            description:
              "No se pudo procesar el token. Por favor, intente nuevamente.",
            variant: "destructive",
          });
        }
      }

      // Verificar si hay un token almacenado en localStorage
      const storedTokenData = localStorage.getItem("MERCADOLIBRE_TOKEN_DATA");
      if (storedTokenData) {
        const tokenData = JSON.parse(storedTokenData);
        if (Date.now() < tokenData.expires_at) {
          await getUserInfo(tokenData.access_token);
        } else {
          await handleTokenRefresh(tokenData.refresh_token);
        }
      } else {
        setIsLoading(false);
      }
    };

    handleAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  const getUserInfo = async (token: string) => {
    try {
      const data = await fetchUserInfo(token);
      setUserInfo(data);
      // toast({
      //   title: 'Sesión iniciada',
      //   description: `Bienvenido ${data.first_name}.`,
      //   variant: 'default',

      // });
    } catch (error) {
      console.error("Error fetching user info:", error);
      localStorage.removeItem("MERCADOLIBRE_TOKEN_DATA");
      toast({
        title: "Error",
        description:
          "No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenRefresh = async (refreshTokenValue: string) => {
    try {
      const newTokenData = await refreshToken(refreshTokenValue);
      localStorage.setItem(
        "MERCADOLIBRE_TOKEN_DATA",
        JSON.stringify({
          ...newTokenData,
          expires_at: Date.now() + newTokenData.expires_in * 1000,
        })
      );
      await getUserInfo(newTokenData.access_token);
    } catch (error) {
      console.error("Error refreshing token:", error);
      localStorage.removeItem("MERCADOLIBRE_TOKEN_DATA");
      toast({
        title: "Error de autenticación",
        description:
          "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[36px] w-full" />;
  }

  return userInfo ? <UserContent userInfo={userInfo} /> : <LoginForm />;
};

export default AuthComponent;
