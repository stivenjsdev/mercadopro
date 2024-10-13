"use client";

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
import { countries } from "@/services/data/countries";
import { LoginFormData } from "@/types/formsData";
import { useForm } from "react-hook-form";

const LoginForm = () => {
  const form = useForm<LoginFormData>({
    defaultValues: {
      country: "com.co",
    },
  });

  const loginSubmit = (data: LoginFormData) => {
    const clientId = process.env.NEXT_PUBLIC_MERCADOLIBRE_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.NEXT_PUBLIC_MERCADOLIBRE_REDIRECT_URI || ""
    );
    const authUrl = `https://auth.mercadolibre.${data.country}/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  return (
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
  );
};

export default LoginForm;
