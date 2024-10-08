import { useKeywords } from "@/hooks/useKeywords";
import { gptQuery } from "@/services/gptApi";
import { getSearches, getSuggestions } from "@/services/mercadolibreApi";
import { Status } from "@/types/formsData";
import { useMutation } from "@tanstack/react-query";
import { OpenAI } from "openai";
import { useEffect, useState } from "react";

export const useProductTitle = () => {
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("success");
  const {
    keywords: imageKeywords,
    status: imageStatus,
    generateKeywordsByImageUrl,
  } = useKeywords();

  const { data: productNameKeywords, mutateAsync: mutateSuggestions } =
    useMutation({
      mutationFn: getSuggestions,
    });

  const { data: searches, mutateAsync: mutateSearches } = useMutation({
    mutationFn: getSearches,
  });

  useEffect(() => {
    if (productNameKeywords && searches && imageKeywords) {
      suggestTitles();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productNameKeywords, searches, imageKeywords]);

  const generateKeywordsAndSuggestedTitles = async (
    productName: string,
    imageUrl: string
  ) => {
    setStatus("loading");
    try {
      // get suggestions and searches by term
      await Promise.all([
        mutateSuggestions(productName),
        mutateSearches(productName),
        generateKeywordsByImageUrl(imageUrl, productName),
      ]);
      setStatus("success");
    } catch (error) {
      console.log(error);
      setStatus("error");
    }
  };

  const suggestTitles = async () => {
    try {
      const examples = searches?.results.map((item) => item.title).join(", ");
      const values = productNameKeywords?.suggested_queries
        .map((item) => item.q)
        .join(", ");
      const valuesImage = imageKeywords?.join(", ");

      console.log(examples);
      console.log(productNameKeywords);
      console.log(valuesImage);

      const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Eres un experto generador de listas de títulos en ESPAÑOL para productos destinados a plataformas de e-commerce como eBay, Amazon y MercadoLibre. Sigue las siguientes pautas: 1. Usa la mayor cantidad posible de palabras clave proporcionadas por el usuario. 2. Los títulos deben ser concisos, atractivos y optimizados para mejorar la visibilidad en motores de búsqueda (SEO). 3. No incluyas signos de puntuación, conectores, conjunciones, preposiciones, tildes, guiones ni caracteres especiales. 4. Los títulos deben estar formados por 8 a 12 palabras clave relevantes, utilizando sinónimos cuando sea necesario. 5. Debes entregarme la lista de títulos directamente, sin incluir palabras adicionales. 6. Cada título debe estar separado por coma de la siguiente forma: 'titulo sugerido 1, titulo sugerido 2, ...'.",
            },
            {
              role: "user",
              content: `10 títulos, palabras claves:${
                values ? ` ${values}, ` : ""
              } ${valuesImage}. Ejemplos de títulos de ese producto o similares: ${examples}`,
            },
          ],
        };

      const { message } = await gptQuery(body);
      if (!message) {
        console.log("useProductTitle -> message", message);
        throw new Error("No message in response");
      }

      console.log(message);
      // Parse keywords json response message to array
      const titles: string[] = message.split(", ");
      setSuggestedTitles([...new Set(titles)]);
      console.log("suggestTitles -> success");
    } catch (error) {
      throw error;
    }
  };

  return {
    productNameKeywords,
    imageKeywords,
    searches,
    suggestedTitles,
    status,
    imageStatus,
    generateKeywordsAndSuggestedTitles,
  };
};