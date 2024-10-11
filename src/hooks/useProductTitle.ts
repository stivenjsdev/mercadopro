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
  SearchResponse,
  TrendsResponse,
} from "@/types/mercadolibreResponses";
import { useMutation } from "@tanstack/react-query";
import { OpenAI } from "openai";
import { useState } from "react";

export const useProductTitle = () => {
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [productNameKeywords, setProductNameKeywords] = useState<string[]>();
  const [searches, setSearches] = useState<SearchResponse>();
  const [trends, setTrends] = useState<TrendsResponse[][]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productNameKeywordsStatus, setProductNameKeywordsStatus] =
    useState<Status>("success");
  const [trendsStatus, setTrendsStatus] = useState<Status>("success");
  const [categoriesStatus, setCategoriesStatus] = useState<Status>("success");
  const [searchesStatus, setSearchesStatus] = useState<Status>("success");
  const [status, setStatus] = useState<Status>("success");
  const {
    keywords: imageKeywords,
    status: imageStatus,
    generateKeywordsByImageUrl,
  } = useKeywords();

  const { mutateAsync: mutateSuggestions } = useMutation({
    mutationFn: getSuggestions,
  });

  const { mutateAsync: mutateSearches } = useMutation({
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
    setProductNameKeywordsStatus("loading");
    setTrendsStatus("loading");
    try {
      // get keywords from product name
      const splitProductName = productName
        .split(" ")
        .map((_, i, arr) => arr.slice(0, arr.length - i).join(" "));
      const productNameKeywords = await Promise.all(
        splitProductName.map((term) =>
          mutateSuggestions({ message: term, siteId })
        )
      );
      const productNameKeywordsFlat = productNameKeywords.flatMap(
        (suggestion) => suggestion.suggested_queries.map((sq) => sq.q)
      );
      const productNameKeywordsUnique = [...new Set(productNameKeywordsFlat)];
      setProductNameKeywords(productNameKeywordsUnique);
      setProductNameKeywordsStatus("success");
      // get searches and keywords from image
      const [searches, imageKeywords] = await Promise.all([
        mutateSearches({ term: productName, siteId }),
        generateKeywordsByImageUrl(imageUrl, productName, siteId),
      ]);
      setSearches(searches);
      setSearchesStatus("success");

      const categoryIds = searches?.results.map((item) => item.category_id);
      const uniqueCategoryIds = [...new Set(categoryIds)];
      console.log("categorías encontradas: ", uniqueCategoryIds);
      const categories = await Promise.allSettled(
        uniqueCategoryIds.map((categoryId) => mutateCategories({ categoryId }))
      );
      console.log("categories data: ", categories);
      categories.forEach((category) => {
        if (category.status === "fulfilled") {
          setCategories((prev) => [...prev, category.value]);
        }
      });
      setCategoriesStatus("success");
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
        setTrendsStatus("success");
        suggestTitles(
          productName,
          productNameKeywordsUnique || [],
          imageKeywords || [],
          trends
        );
      }
      setStatus("success");
    } catch (error) {
      console.log(error);
      setStatus("error");
      setProductNameKeywordsStatus("success");
      setTrendsStatus("success");
      setCategoriesStatus("success");
    }
  };

  const suggestTitles = async (
    productName: string,
    productNameKeywords: string[],
    imageKeywords: string[],
    trends: TrendsResponse[][]
  ) => {
    try {
      const values = productNameKeywords?.join(", ");
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
                "Eres un experto generador de listas de títulos en ESPAÑOL para productos destinados a plataformas de e-commerce como eBay, Amazon y MercadoLibre. Sigue las siguientes pautas: 1. Usa la mayor cantidad posible de palabras clave proporcionadas por el usuario. 2. Los títulos deben ser concisos, atractivos y optimizados para mejorar la visibilidad en motores de búsqueda (SEO). 3. No incluyas signos de puntuación, conectores, conjunciones, preposiciones, tildes, guiones ni caracteres especiales. 4. Los títulos deben estar formados por 8 a 15 palabras clave relevantes 5. Debes entregarme la lista de títulos directamente, sin incluir palabras adicionales. 6. Cada título debe estar separado por coma de la siguiente forma: 'titulo sugerido 1, titulo sugerido 2, ...'.",
            },
            {
              role: "user",
              content: `4 títulos, para crear los títulos, solo ve adicionando todas las palabras claves que te doy, generando varias combinaciones coherentes y concisas y comenzando siempre por el nombre del producto, palabras claves:[${
                values ? ` ${values}, ` : ""
              } ${valuesImage} ${valuesTrends}]. El último título debe ser una combinación de todas las palabras claves. La anterior lista de palabras claves pueden contener palabras claves que no representan en absoluto al producto **${productName}**, por favor, identifica cuales si, y utilízalas para los títulos generados. Procura que el titulo generado no tenga palabras repetidas, como por ejemplo si tenemos las palabras claves [peluche gato], [peluche gato lucifer], [peluche gato original] No generes un titulo asi: [peluche gato peluche gato lucifer peluche gato original] si no asi: [peluche gato lucifer original]. Utiliza la mayor cantidad de palabras claves para cada título.`,
            },
          ],
        };

      const { message } = await gptQuery(body);
      if (!message) {
        console.log("useProductTitle -> message", message);
        throw new Error("No message in response");
      }

      // Parse keywords json response message to array
      console.log("títulos generados: ", message);
      const titles: string[] = message.split(", ");
      setSuggestedTitles([...new Set(titles)]);
    } catch (error) {
      console.log(error);
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
    productNameKeywordsStatus,
    trendsStatus,
    categoriesStatus,
    searchesStatus,
    status,
    imageStatus,
    generateKeywordsSuggestedTitlesAndTrends,
  };
};
