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
import useTermSearch from "@/hooks/useTermSearch";
import { TermFormData } from "@/types/formsData";
import { useForm } from "react-hook-form";
import { ResultCard } from "../card/ResultCard";

export default function TermSearch() {
  const { suggestions, searches, suggestedTitles, status, searchTerm } =
    useTermSearch();

  const form = useForm<TermFormData>({
    defaultValues: { message: "" },
  });

  const onSubmit = (formData: TermFormData) => {
    if (!formData.message) return;
    searchTerm(formData.message);
    form.reset();
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-2">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Termino de Búsqueda</FormLabel>
                <FormControl>
                  <Input placeholder="Que deseas buscar?..." {...field} />
                </FormControl>
                <FormDescription>
                  Este es tu termino de búsqueda para buscar productos en ML.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Consultar</Button>
        </form>
      </Form>

      <ResultCard
        title="Sugerencias de Mercadolibre"
        description="Estas son las sugerencias de búsqueda generadas por ML."
        status={status}
      >
        {suggestions &&
          suggestions.suggested_queries.map((suggested_query, index) => (
            <p key={index}>{suggested_query.q}</p>
          ))}
      </ResultCard>

      <ResultCard
        title="Búsquedas de Mercadolibre"
        description="Estos son los títulos de los productos encontrados en ML."
        status={status}
      >
        {searches &&
          searches.results.map((result) => (
            <p key={result.id} className="py-2">
              {result.title}{" "}
              <span className="text-xs">
                ({result.title.length} caracteres)
              </span>
            </p>
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
                <div className="p-3" key={index}>
                  <p>{title.trim()} </p>
                  <p className="text-xs">({title.length} caracteres)</p>
                </div>
              );
          })}
      </ResultCard>
    </div>
  );
}
