import { gptQuery } from "@/services/gptApi";
import { getSuggestions } from "@/services/mercadolibreApi";
import { Status } from "@/types/formsData";
import { useMutation } from "@tanstack/react-query";
import OpenAI from "openai";
import { useState } from "react";

export const useKeywords = () => {
  const [status, setStatus] = useState<Status>("success");
  const [keywords, setKeywords] = useState<string[] | null>(null);
  const suggestionsMutation = useMutation({
    mutationFn: getSuggestions,
  });

  const generateKeywordsByImageUrl = async (
    url: string,
    productName: string,
    siteId: string
  ): Promise<string[] | undefined> => {
    setStatus("loading");
    try {
      // Define the body of get keywords by image url
      const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Por favor, genere una lista completa de palabras clave relevantes en español para el producto **${productName}**, optimizada para la visibilidad en búsquedas y la atracción de tráfico en plataformas de comercio electrónico como eBay, Amazon y MercadoLibre. Las palabras clave deben describir con precisión el producto, sus características y su categoría. Tenga en cuenta la siguiente información para crear la lista: * La categoría del producto (validando si viene en el nombre del producto o de tu propia definición) * La descripción del producto (resuma los puntos principales). * El público objetivo (especifique si se trata de un grupo de edad, sexo o intereses concretos). Responde me directamente con las palabras claves sin incluir palabras adicionales, separadas por comas, de esta forma:  "palabra clave 1, palabra clave 2, palabra clave 3, ...". Por favor, asegúrese de que las palabras clave están en español y cubren todos los aspectos necesarios del producto para que sea fácilmente descubrible por el público objetivo en las plataformas de comercio electrónico mencionadas.`,
                },
                {
                  type: "image_url",
                  image_url: { url },
                },
              ],
            },
          ],
        };

      // Get the keywords by image url
      const { message } = await gptQuery(body);
      if (!message) {
        // setStatus("error");
        const keywords: string[] = [];
        return keywords;
      }

      console.log("useKeywords -> message:", message);
      // Parse keywords json response message to array
      const unvalidatedKeywords: string[] = message.split(", ");
      // Validated keywords arr
      const keywords = [];

      // Validate keywords
      for (const keyword of unvalidatedKeywords) {
        const formattedKeyword = keyword
          .trim()
          .replace(/[.,-]/g, "")
          .toLowerCase();
        const k = await suggestionsMutation.mutateAsync({
          message: formattedKeyword,
          siteId,
        });
        if ((k?.suggested_queries ?? []).length > 0) {
          keywords.push(formattedKeyword);
          k?.suggested_queries.forEach((suggested_query) => {
            keywords.push(suggested_query.q);
          });
        }
      }

      const uniqueKeywords: string[] =
        [...new Set(keywords)].length > 0 ? [...new Set(keywords)] : [];

      setKeywords(uniqueKeywords);
      setStatus("success");
      return uniqueKeywords;
    } catch (error) {
      console.log(error);
      setStatus("error");
    }
  };

  return { status, keywords, generateKeywordsByImageUrl };
};
