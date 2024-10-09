"use client";

import DescriptionSearch from "@/components/search/DescriptionSearch";
import TitleSearch from "@/components/search/TitleSearch";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserInfo } from "@/types/mercadolibreResponses";
import { TokenData } from "@/types/tokenData";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type Country = {
  value: string;
  label: string;
};

const countries: Country[] = [
  { value: "com.ar", label: "Argentina" },
  { value: "com.bo", label: "Bolivia" },
  { value: "com.br", label: "Brasil" },
  { value: "cl", label: "Chile" },
  { value: "com.co", label: "Colombia" },
  { value: "co.cr", label: "Costa Rica" },
  { value: "com.do", label: "Dominicana" },
  { value: "com.ec", label: "Ecuador" },
  { value: "com.sv", label: "El Salvador" },
  { value: "com.gt", label: "Guatemala" },
  { value: "com.hn", label: "Honduras" },
  { value: "com.mx", label: "Mexico" },
  { value: "com.ni", label: "Nicaragua" },
  { value: "com.pa", label: "Panamá" },
  { value: "com.py", label: "Paraguay" },
  { value: "com.pe", label: "Perú" },
  { value: "com.uy", label: "Uruguay" },
  { value: "com.ve", label: "Venezuela" },
];

const AuthComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<{ country: string }>({
    defaultValues: {
      country: "com.co",
    },
  });

  useEffect(() => {
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
      }
    }

    // Verificar si hay un token en localStorage
    const storedTokenData = localStorage.getItem("MERCADOLIBRE_TOKEN_DATA");
    if (storedTokenData) {
      const tokenData = JSON.parse(storedTokenData);
      if (Date.now() < tokenData.expires_at) {
        fetchUserInfo(tokenData.access_token);
      } else {
        refreshToken(tokenData.refresh_token);
      }
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  const loginSubmit = (data: { country: string }) => {
    const clientId = process.env.NEXT_PUBLIC_MERCADOLIBRE_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.NEXT_PUBLIC_MERCADOLIBRE_REDIRECT_URI || ""
    );
    const authUrl = `https://auth.mercadolibre.${data.country}/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch(`/api/user/me?token=${token}`);
      if (response.ok) {
        const data: UserInfo = await response.json();
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

  const refreshToken = async (refreshToken: string) => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const newTokenData: TokenData = await response.json();
        localStorage.setItem(
          "MERCADOLIBRE_TOKEN_DATA",
          JSON.stringify({
            ...newTokenData,
            expires_at: Date.now() + newTokenData.expires_in * 1000,
          })
        );
        fetchUserInfo(newTokenData.access_token);
      } else {
        console.error("Error refreshing token");
        localStorage.removeItem("MERCADOLIBRE_TOKEN_DATA");
        setIsLoading(false);
      }
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
            {userInfo.first_name} {userInfo.last_name}
          </h2>
          <Tabs defaultValue="title" className="w-full">
            <TabsList className="w-full flex flex-row">
              <TabsTrigger value="title" className="flex-1">
                Titulo de Producto
              </TabsTrigger>
              <TabsTrigger value="description" className="flex-1">
                Descripción de Producto
              </TabsTrigger>
            </TabsList>
            <TabsContent value="title">
              <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                {/* Componente Consulta Titulo*/}
                <TitleSearch userData={userInfo} />
              </Suspense>
            </TabsContent>
            <TabsContent value="description">
              <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                {/* Componente Generar Description */}
                <DescriptionSearch userData={userInfo} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(loginSubmit)}
            className="space-y-6 mb-4"
          >
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Selecciona tu país
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu país" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem
                          key={country.value}
                          value={String(country.value)}
                        >
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Vincular con MercadoLibre
            </Button>
          </form>
        </Form>
      )}
    </>
  );
};

export default AuthComponent;
