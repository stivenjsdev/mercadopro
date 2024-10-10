import { useKeywords } from "@/hooks/useKeywords";
import { gptQuery } from "@/services/gptApi";
import {
  getCategoryById,
  getSearches,
  getSuggestions,
  getTrends,
} from "@/services/mercadolibreApi";
import { Status } from "@/types/formsData";
import {
  Category,
  SuggestionsResponse,
  TrendsResponse,
} from "@/types/mercadolibreResponses";
import { useMutation } from "@tanstack/react-query";
import { OpenAI } from "openai";
import { useState } from "react";

export const useProductTitle = () => {
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [trends, setTrends] = useState<TrendsResponse[][]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const { mutateAsync: mutateTrends } = useMutation({
    mutationFn: getTrends,
  });

  const { mutateAsync: mutateCategories } = useMutation({
    mutationFn: getCategoryById,
  });

  const generateKeywordsSuggestedTitlesAndTrends = async (
    productName: string,
    imageUrl: string,
    siteId: string
  ) => {
    setStatus("loading");
    try {
      // get suggestions and searches by term
      const [productNameKeywords, searches, imageKeywords] = await Promise.all([
        mutateSuggestions({ message: productName, siteId }),
        mutateSearches({ term: productName, siteId }),
        generateKeywordsByImageUrl(imageUrl, productName, siteId),
      ]);

      const categoryIds = searches?.results.map((item) => item.category_id);
      const uniqueCategoryIds = [...new Set(categoryIds)];
      console.log("categorías encontradas: ", uniqueCategoryIds);
      const categories = await Promise.all(
        uniqueCategoryIds.map((categoryId) => mutateCategories({ categoryId }))
      );
      setCategories(categories);
      const storedTokenData = localStorage.getItem("MERCADOLIBRE_TOKEN_DATA");
      if (storedTokenData) {
        const tokenData = JSON.parse(storedTokenData);
        const trends: TrendsResponse[][] = await Promise.all(
          uniqueCategoryIds.map((categoryId) =>
            mutateTrends({
              categoryId,
              siteId,
              accessToken: tokenData.access_token,
            })
          )
        );
        setTrends(trends);
        suggestTitles(productNameKeywords || [], imageKeywords || [], trends);
      }
      setStatus("success");
    } catch (error) {
      console.log(error);
      setStatus("error");
    }
  };

  const suggestTitles = async (
    productNameKeywords: SuggestionsResponse,
    imageKeywords: string[],
    trends: TrendsResponse[][]
  ) => {
    try {
      const values = [...new Set(productNameKeywords.suggested_queries)]
        .map((item) => item.q)
        .join(", ");
      const valuesImage = imageKeywords?.join(", ");
      const valuesTrends = trends
        .flat()
        .map((obj) => obj.keyword)
        .join(", ");
      console.log("valuesTrends: ", valuesTrends);

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
              content: `10 títulos, palabras claves:[${
                values ? ` ${values}, ` : ""
              } ${valuesImage}]. La siguiente lista de palabras claves pueden contener palabras claves que no representan en absoluto al producto, por favor, identifica cuales si, y utilízalas para los 10 títulos generados: [${valuesTrends}]. Utiliza la mayor cantidad de palabras claves que puedas por título.`,
            },
          ],
        };

      const { message } = await gptQuery(body);
      if (!message) {
        console.log("useProductTitle -> message", message);
        throw new Error("No message in response");
      }

      // Parse keywords json response message to array
      const titles: string[] = message.split(", ");
      setSuggestedTitles([...new Set(titles)]);
    } catch (error) {
      throw error;
    }
  };

  return {
    productNameKeywords,
    imageKeywords,
    searches,
    trends,
    categories,
    suggestedTitles,
    status,
    imageStatus,
    generateKeywordsSuggestedTitlesAndTrends,
  };
};
