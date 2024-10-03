"use client";

import { ResultCard } from "@/components/card/ResultCard";
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
import useImageSearch from "@/hooks/useImageSearch";
import { ImageFormData } from "@/types/formsData";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ImageSearch() {
  const [url, setUrl] = useState("");
  const { keywords, description, status, generateImageResults } =
    useImageSearch();

  const form = useForm<ImageFormData>({
    defaultValues: { url: "" },
  });

  const onSubmit = (formData: ImageFormData) => {
    if (!formData.url) return;
    setUrl(formData.url);
    generateImageResults(formData.url);
    form.reset();
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-2">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL imagen del Producto</FormLabel>
                <FormControl>
                  <Input placeholder="URL imagen del producto..." {...field} />
                </FormControl>
                <FormDescription>
                  Genera Keywords y Descripción sobre el Producto.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Generar</Button>
        </form>
      </Form>

      <div className="flex justify-center">
        {url && (
          <Image
            src={url}
            alt="product"
            width={128}
            height={128}
            className="w-28 h-auto"
          />
        )}
      </div>

      <ResultCard
        title="Palabras Claves Generadas"
        description="Estas son las keywords generadas por IA para el producto."
        status={status}
      >
        {keywords && keywords.length !== 0 && <p>{keywords}</p>}
      </ResultCard>

      <ResultCard
        title="Descripción de Producto Generada"
        description="Esta es la descripción generada por IA para el producto."
        status={status}
      >
        {description && description.length !== 0 && (
          <Markdown remarkPlugins={[remarkGfm]} className="space-y-4">
            {description}
          </Markdown>
        )}
      </ResultCard>
    </div>
  );
}
