import { gptQuery } from "@/services/gptApi";
import { getSearches, getSuggestions } from "@/services/mercadolibreApi";
import { Status } from "@/types/formsData";
import {
  SearchResponse,
  SuggestionsResponse,
} from "@/types/mercadolibreResponses";
import { useMutation } from "@tanstack/react-query";
import { OpenAI } from "openai";
import { useState } from "react";

export default function useTermSearch() {
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("success");

  const { data: suggestions, mutateAsync: mutateSuggestions } = useMutation({
    mutationFn: getSuggestions,
  });

  const { data: searches, mutateAsync: mutateSearches } = useMutation({
    mutationFn: getSearches,
  });

  const searchTerm = async (term: string) => {
    setStatus("loading");
    try {
      const [suggestions, searches] = await Promise.all([
        mutateSuggestions(term),
        mutateSearches(term),
      ]);
      await suggestTitles(suggestions.suggested_queries, searches.results);
      setStatus("success");
    } catch (error) {
      console.log(error);
      setStatus("error");
    }
  };

  const suggestTitles = async (
    suggestions: SuggestionsResponse["suggested_queries"],
    searches: SearchResponse["results"]
  ) => {
    try {
      const examples = searches.map((item) => item.title).join(", ");
      const values = suggestions.map((item) => item.q).join(", ");

      const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Eres un experto generador de listas de títulos para productos destinados a plataformas de e-commerce como eBay, Amazon y MercadoLibre. Sigue las siguientes pautas: 1. Usa la mayor cantidad posible de palabras clave proporcionadas por el usuario. 2. Los títulos deben ser concisos, atractivos y optimizados para mejorar la visibilidad en motores de búsqueda (SEO). 3. No incluyas signos de puntuación, conectores, conjunciones, preposiciones, tildes, guiones ni caracteres especiales. 4. Los títulos deben estar formados por 8 a 12 palabras clave relevantes, utilizando sinónimos cuando sea necesario. 5. Cada título debe estar separado por un salto de línea obligatorio.",
            },
            {
              role: "user",
              content: `10 títulos, palabras claves: ${values}. Ejemplos de títulos de ese producto o similares: ${examples}`,
            },
          ],
        };

      const response = await gptQuery(body);
      setSuggestedTitles([...new Set(response.message.split("\n"))]);
    } catch (error) {
      throw error;
    }
  };

  return {
    suggestions,
    searches,
    suggestedTitles,
    status,
    searchTerm,
  };
}
