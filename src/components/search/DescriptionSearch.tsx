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
import useProductDescription from "@/hooks/useProductDescription";
import { ImageFormData } from "@/types/formsData";
import { UserInfo } from "@/types/mercadolibreResponses";
import { isValidURL } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type DescriptionSearchProps = {
  userData: UserInfo;
};

export default function DescriptionSearch({
  userData,
}: DescriptionSearchProps) {
  const [url, setUrl] = useState("");
  const [imageError, setImageError] = useState(false);
  const {
    keywords,
    description,
    status,
    imageStatus,
    generateKeywordsAndSuggestedDescription,
  } = useProductDescription();

  const form = useForm<ImageFormData>({
    defaultValues: { url: "", productName: "" },
    mode: "onBlur", // This will trigger validation on blur
  });

  const onSubmit = (formData: ImageFormData) => {
    const { productName, url } = formData;
    setUrl(formData.url);
    setImageError(false);
    generateKeywordsAndSuggestedDescription(productName, url, userData.site_id);
    // form.reset();
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-2">
          <FormField
            control={form.control}
            name="url"
            rules={{
              required: "La URL de la imagen es requerida",
              validate: {
                validURL: (value) =>
                  isValidURL(value) || "La URL de la imagen no es válida",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL imagen del Producto</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Pega la URL de tu imagen aquí..."
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
          <FormField
            control={form.control}
            name="productName"
            rules={{ required: "El nombre del producto es requerido" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Producto</FormLabel>
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
          <Button type="submit">Generar</Button>
        </form>
      </Form>

      <div className="flex justify-center">
        {url ? (
          !imageError ? (
            <Image
              src={url}
              alt="product"
              width={128}
              height={128}
              className="w-28 h-auto"
              onError={() => setImageError(true)}
            />
          ) : (
            <p>
              No se puede cargar la imagen, Por favor, verifica la URL e intenta
              de nuevo.
            </p>
          )
        ) : (
          ""
        )}
      </div>

      <ResultCard
        title="Palabras Claves Generadas"
        description="Estas son las keywords generadas por IA para el producto."
        status={imageStatus}
      >
        {keywords &&
          keywords.length !== 0 &&
          keywords.map((imageKeyword, index) => (
            <p key={`${index}-${imageKeyword}`}>{imageKeyword}</p>
          ))}
      </ResultCard>

      <ResultCard
        title="Descripción de Producto Generada"
        description="Esta es la descripción generada por IA para el producto."
        status={status}
      >
        {description && description.length !== 0 && (
          <Markdown remarkPlugins={[remarkGfm]} className="space-y-4">
            {description.replace(
              /\n\n#/g,
              "\n\n//////////////////////////////\n#"
            )}
          </Markdown>
        )}
      </ResultCard>
    </div>
  );
}
