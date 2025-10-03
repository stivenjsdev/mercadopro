import { useKeywords } from "@/hooks/useKeywords";
import { gptQuery } from "@/services/gptApi";
import {
  getCategoriesByTerm,
  getCategoryById,
  getProductDataByUrl,
  // getSearches,
  getSuggestions,
  getTrends,
} from "@/services/mercadolibreApi";
import { Status } from "@/types/formsData";
import {
  Category,
  // SearchResponse,
  TrendsResponse,
} from "@/types/mercadolibreResponses";
import { useMutation } from "@tanstack/react-query";
import { OpenAI } from "openai";
import { useState } from "react";

export const useProductTitle = () => {
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [productNameKeywords, setProductNameKeywords] = useState<string[]>([]);
  // const [searches, setSearches] = useState<SearchResponse | null>(null);
  const [trends, setTrends] = useState<TrendsResponse[][]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productNameKeywordsStatus, setProductNameKeywordsStatus] =
    useState<Status>("success");
  const [trendsStatus, setTrendsStatus] = useState<Status>("success");
  const [categoriesStatus, setCategoriesStatus] = useState<Status>("success");
  // const [searchesStatus, setSearchesStatus] = useState<Status>("success");
  const [status, setStatus] = useState<Status>("success");
  const {
    keywords: imageKeywords,
    status: imageStatus,
    generateKeywordsByImageUrl,
  } = useKeywords();

  const { mutateAsync: mutateSuggestions } = useMutation({
    mutationFn: getSuggestions,
  });

  const { mutateAsync: mutateProductDataByUrl } = useMutation({
    mutationFn: getProductDataByUrl,
  });

  const { mutateAsync: mutateCategoriesByTerm } = useMutation({
    mutationFn: getCategoriesByTerm,
  });

  // const { mutateAsync: mutateSearches } = useMutation({
  //   mutationFn: getSearches,
  // });

  const { mutateAsync: mutateTrends } = useMutation({
    mutationFn: getTrends,
  });

  const { mutateAsync: mutateCategories } = useMutation({
    mutationFn: getCategoryById,
  });

  const generateKeywordsSuggestedTitlesAndTrends = async (
    productName: string,
    productUrl: string,
    imageUrl: string,
    siteId: string
  ) => {
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

      // get access token from localStorage, for requests that need access token
      const storedTokenData = localStorage.getItem("MERCADOLIBRE_TOKEN_DATA");
      if (storedTokenData) {
        const tokenData = JSON.parse(storedTokenData);

        // get Product Data by scraping and keywords from Image
        const [productData, imageKeywords] = await Promise.all([
          mutateProductDataByUrl({
            productUrl,
          }),
          generateKeywordsByImageUrl(imageUrl, productName, siteId),
        ]);
        console.log("data del producto obtenida por scraping: [productData]: ", productData);
        // setSearches(searches);
        // setSearchesStatus("success");

        // Get category texts from product data using web scraping
        const categoryTexts = productData.categoryTexts || [];
        console.log("arreglo de categorías de productData: [categoryTexts]: ", categoryTexts);
        // const categoryText = categoryTexts[categoryTexts.length - 1] || ""; // alternativa al at(-1)
        const categoryText = categoryTexts.at(-1) || "";
        console.log("ultimo elemento de categoryTexts: [categoryText]: ", categoryText); // Representa la categoría exacta

        const categoriesByTerm = await mutateCategoriesByTerm({
          term: categoryText,
          siteId,
          token: tokenData.access_token,
        });
        console.log("Categorías obtenidas de la api de Meli a partir de categoryText(term): [categoriesByTerm]: ", categoriesByTerm);
        const categoryIds = categoriesByTerm.map(
          (category) => category.category_id
        );

        const categories = await Promise.all(
          categoryIds.map((categoryId) =>
            mutateCategories({ categoryId, token: tokenData.access_token })
          )
        );

        // Compara el arreglo de categoryTexts con path_from_root de cada categoría de categories para encontrar la categoría que coincide exactamente
        // si no hay coincidencia exacta, devolver null
        const category = findCategory(categories, categoryTexts);

        // get all categories associated with previous searches
        // const categoryIds = searches?.results.map((item) => item.category_id);
        // const uniqueCategoryIds = [...new Set(categoryIds)];

        // console.log("categoría encontrada: ", uniqueCategoryIds);
        // const categories = await Promise.all(
        //   uniqueCategoryIds.map((categoryId) =>
        //     mutateCategories({ categoryId })
        //   )
        // );
        console.log("[categories]: ", categories);
        console.log("[Category]: ", category);
        // setCategories(categories);
        // setCategoriesStatus("success");
        let trend = null;
        if (category) {
          setCategories([category]);
          setCategoriesStatus("success");
          // get trend
          trend = await mutateTrends({
            categoryId: category.id,
            siteId,
            accessToken: tokenData.access_token,
          });
          setTrends([trend]);
          setTrendsStatus("success");
        } else {
          setCategories([]);
          setCategoriesStatus("success");
          setTrends([]);
          setTrendsStatus("success");
        }

        // const trends = await Promise.allSettled(
        //   uniqueCategoryIds.map((categoryId) =>
        //     mutateTrends({
        //       categoryId,
        //       siteId,
        //       accessToken: tokenData.access_token,
        //     })
        //   )
        // );
        // const fullFilledTrends = trends
        //   .map((trend) => {
        //     if (trend.status === "fulfilled") {
        //       return trend.value;
        //     }
        //   })
        //   .filter((trend): trend is TrendsResponse[] => trend !== undefined);
        // setTrends(fullFilledTrends);
        // setTrendsStatus("success");
        suggestTitles(
          productName,
          productNameKeywordsUnique || [],
          imageKeywords || [],
          // fullFilledTrends || []
          trend ? [trend] : []
        );
      }
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
    setStatus("loading");
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
                "Eres un experto generador de listas de títulos en ESPAÑOL para productos destinados a plataformas de e-commerce como eBay, Amazon y MercadoLibre. Sigue las siguientes pautas: 1. Usa la mayor cantidad posible de palabras clave proporcionadas por el usuario. 2. Los títulos deben ser concisos, atractivos y optimizados para mejorar la visibilidad en motores de búsqueda (SEO). 3. No incluyas signos de puntuación, conectores, conjunciones, preposiciones, tildes, guiones ni caracteres especiales. 4. Debes entregarme la lista de títulos directamente, sin incluir palabras adicionales. 5. Cada título debe estar separado por coma de la siguiente forma: 'titulo sugerido 1, titulo sugerido 2, ...'. 6. Los títulos no deben contener palabras repetidas, por ejemplo sería un error un titulo de la siguiente forma 'ejercitador suelo pelvico ejercitador mandibular' ya que contiene 2 veces la palabra ejercitador, el titulo correcto sería 'ejercitador suelo pelvico mandibular'.",
            },
            {
              role: "user",
              content: `4 títulos, para formando los títulos, solo ve adicionando todas las palabras claves que te doy, generando varias combinaciones coherentes y concisas y comenzando siempre por el nombre del producto: **${productName}**, palabras claves:[${
                values ? ` ${values}, ` : ""
              } ${valuesImage} ${valuesTrends}]. La anterior lista de palabras claves pueden contener palabras claves que no representan en absoluto al producto **${productName}**, por favor, identifica cuales si, y utilízalas para los títulos generados. El último título debe ser una combinación de todas las palabras claves. Procura que el titulo generado no tenga palabras repetidas incluyendo las palabras del nombre del producto **${productName}**, como por ejemplo si tenemos las palabras claves [peluche gato], [peluche gato lucifer], [peluche gato original] No generes un titulo asi: [peluche gato peluche gato lucifer peluche gato original] si no asi: [peluche gato lucifer original] omitiendo palabras ya iguales, ejemplo 2: incorrecto: [basurero multiusos basurero cocina basurero carro basurero inteligente] correcto: [basurero multiusos cocina carro inteligente]. Utiliza la mayor cantidad de palabras claves o todas para cada título.`,
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
      setStatus("success");
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const findCategory = (
    categories: Category[],
    categoryTexts: string[]
  ): Category | null => {
    const encontrada = categories.find((category) => {
      const names = category.path_from_root.map((item) => item.name);
      console.log("findCategory(): names: ", names);
      return JSON.stringify(names) === JSON.stringify(categoryTexts);
    });
    console.log("findCategory(): encontrada: ", encontrada);

    return encontrada ? encontrada : null;
    // return encontrada
    //   ? encontrada.path_from_root[encontrada.path_from_root.length - 1].id
    //   : "";
  };

  return {
    productNameKeywords,
    imageKeywords,
    // searches,
    trends,
    categories,
    suggestedTitles,
    productNameKeywordsStatus,
    trendsStatus,
    categoriesStatus,
    // searchesStatus,
    status,
    imageStatus,
    generateKeywordsSuggestedTitlesAndTrends,
    suggestTitles,
  };
};
