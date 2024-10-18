"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProductTitle } from "@/hooks/useProductTitle";
import { TermFormData } from "@/types/formsData";
import { UserInfo } from "@/types/mercadolibreResponses";
import { isValidURL } from "@/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import TitleAccordion from "../TitleAccordion";

type TitleSearchProps = {
  userData: UserInfo;
};

export default function TitleSearch({ userData }: TitleSearchProps) {
  const [productNameStorage, setProductNameStorage] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);

  const {
    productNameKeywords,
    imageKeywords,
    searches,
    trends,
    categories,
    suggestedTitles,
    productNameKeywordsStatus,
    searchesStatus,
    trendsStatus,
    categoriesStatus,
    status,
    imageStatus,
    generateKeywordsSuggestedTitlesAndTrends,
    suggestTitles,
  } = useProductTitle();

  const form = useForm<TermFormData>({
    defaultValues: { productName: "", imageUrl: "" },
    mode: "onBlur", // This will trigger validation on blur
  });

  const onSubmit = async (formData: TermFormData) => {
    const { productName, imageUrl } = formData;
    setProductNameStorage(productName);
    setIsButtonLoading(true);
    await generateKeywordsSuggestedTitlesAndTrends(
      productName,
      imageUrl,
      userData.site_id
    );
    setIsButtonLoading(false);
    setShowAccordion(true);
    // form.reset();
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-2">
          <FormField
            control={form.control}
            name="productName"
            rules={{ required: "El nombre del producto es requerido" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Termino de Búsqueda</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Escribe aquí el nombre del producto..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Este es el nombre de tu producto.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            rules={{
              required: "La URL de la imagen es requerida",
              validate: {
                validURL: (value) =>
                  isValidURL(value) || "La URL de la imagen no es válida",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Imagen del Producto</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Pega aquí la url de la imagen..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Esta es la url de la imagen de tu producto.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">
            {isButtonLoading ? (
              <>
                <Loader2
                  size={24}
                  className={`animate-spin text-white mr-2`}
                  aria-label="Cargando"
                />
                Consultando...
              </>
            ) : (
              "Consultar"
            )}
          </Button>
        </form>
      </Form>

      {showAccordion && (
        <TitleAccordion
          productNameStorage={productNameStorage}
          productNameKeywords={productNameKeywords}
          imageKeywords={imageKeywords}
          searches={searches}
          trends={trends}
          categories={categories}
          suggestedTitles={suggestedTitles}
          productNameKeywordsStatus={productNameKeywordsStatus}
          searchesStatus={searchesStatus}
          trendsStatus={trendsStatus}
          categoriesStatus={categoriesStatus}
          status={status}
          imageStatus={imageStatus}
          suggestTitles={suggestTitles}
        />
      )}
    </div>
  );
}
