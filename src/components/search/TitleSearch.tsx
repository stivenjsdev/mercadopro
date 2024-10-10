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
import { useForm } from "react-hook-form";
import { ResultCard } from "../card/ResultCard";

type TitleSearchProps = {
  userData: UserInfo;
};

export default function TitleSearch({ userData }: TitleSearchProps) {
  const {
    productNameKeywords,
    imageKeywords,
    searches,
    trends,
    suggestedTitles,
    status,
    imageStatus,
    generateKeywordsSuggestedTitlesAndTrends,
  } = useProductTitle();

  const form = useForm<TermFormData>({
    defaultValues: { productName: "", imageUrl: "" },
    mode: "onBlur", // This will trigger validation on blur
  });

  const onSubmit = (formData: TermFormData) => {
    const { productName, imageUrl } = formData;
    generateKeywordsSuggestedTitlesAndTrends(
      productName,
      imageUrl,
      userData.site_id
    );
    form.reset();
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
          <Button type="submit">Consultar</Button>
        </form>
      </Form>

      <ResultCard
        title="Palabras claves por nombre de producto"
        description="Estas son las sugerencias de búsqueda generadas por ML."
        status={status}
      >
        {productNameKeywords &&
          productNameKeywords.suggested_queries &&
          productNameKeywords.suggested_queries.length > 0 &&
          [...new Set(productNameKeywords.suggested_queries)].map(
            (suggested_query, index) => <p key={index}>{suggested_query.q}</p>
          )}
      </ResultCard>

      <ResultCard
        title="Palabras claves por imagen de producto"
        description="Estas son las sugerencias de búsqueda generadas por ML."
        status={imageStatus}
      >
        {imageKeywords &&
          imageKeywords.map((imageKeyword, index) => (
            <p key={`${index}-${imageKeyword}`}>{imageKeyword}</p>
          ))}
      </ResultCard>

      <ResultCard
        title="Tendencias"
        description="Estas son las búsquedas más populares, ordenadas de la mayor a la menor solicitada."
        status={status}
      >
        {trends &&
          trends.length !== 0 &&
          trends.map((categoryTrends) =>
            categoryTrends.map((trend, index) => (
              <p key={`${index}-${trend.keyword}`}>
                {index + 1}. {trend.keyword}
              </p>
            ))
          )}
      </ResultCard>

      <ResultCard
        title="Búsquedas de Mercadolibre"
        description="Estos son los títulos de los productos encontrados en ML."
        status={status}
      >
        {searches &&
          searches.results.map((result) => (
            <div key={result.id} className="p-3">
              <p>{result.title} </p>
              <p className="text-xs">({result.title.length} caracteres)</p>
            </div>
          ))}
      </ResultCard>

      <ResultCard
        title="Titulo de Producto Sugerido"
        description="Estas son las sugerencias generadas por IA para los títulos de los productos en ML."
        status={status}
      >
        {suggestedTitles &&
          suggestedTitles.length !== 0 &&
          suggestedTitles.map((title, index) => {
            if (title)
              return (
                <div key={index} className="p-3">
                  <p>{title.trim()} </p>
                  <p className="text-xs">({title.length} caracteres)</p>
                </div>
              );
          })}
      </ResultCard>
    </div>
  );
}
