"use client";

import DescriptionSearch from "@/components/search/DescriptionSearch";
import TitleSearch from "@/components/search/TitleSearch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserInfo } from "@/types/mercadolibreResponses";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

const AuthComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token en la URL
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      // Almacenar el token en localStorage
      localStorage.setItem("MERCADOLIBRE_TOKEN_DATA", tokenFromUrl);
      // Limpiar el token de la URL
      router.replace("/");
    }

    // Verificar si hay un token en localStorage
    const token = localStorage.getItem("MERCADOLIBRE_TOKEN_DATA");
    if (token) {
      fetchUserInfo(token);
    } else {
      setIsLoading(false);
    }
  }, [searchParams, router]);

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_MERCADOLIBRE_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.NEXT_PUBLIC_MERCADOLIBRE_REDIRECT_URI || ""
    );
    const authUrl = `https://auth.mercadolibre.com.co/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch("https://api.mercadolibre.com/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setUserInfo(data);
      } else {
        console.error("Error fetching user info");
        localStorage.removeItem("MERCADOLIBRE_TOKEN_DATA");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Skeleton className="h-[36px] w-full" />
      ) : userInfo ? (
        <>
          <h2 className="text-sm font-light text-center">
            Bienvenido {userInfo.first_name} {userInfo.last_name}
          </h2>
          <Tabs defaultValue="term" className="w-full">
            <TabsList className="w-full flex flex-row">
              <TabsTrigger value="term" className="flex-1">
                Titulo de Producto
              </TabsTrigger>
              <TabsTrigger value="image" className="flex-1">
                Descripción de Producto
              </TabsTrigger>
            </TabsList>
            <TabsContent value="term">
              <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                {/* Componente Consulta por Termino */}
                <TitleSearch />
              </Suspense>
            </TabsContent>
            <TabsContent value="image">
              <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                {/* Componente Generar por URL de Imagen */}
                <DescriptionSearch />
              </Suspense>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Button onClick={handleLogin} className="w-full">
          Vincular con MercadoLibre
        </Button>
      )}
    </>
  );
};

export default AuthComponent;