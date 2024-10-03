import { gptQuery } from "@/services/gptApi";
import { getSuggestions } from "@/services/mercadolibreApi";
import { Status } from "@/types/formsData";
import { useMutation } from "@tanstack/react-query";
import { OpenAI } from "openai";
import { useState } from "react";

export default function useImageSearch() {
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("success");

  const suggestionsMutation = useMutation({
    mutationFn: getSuggestions,
  });

  const generateImageResults = async (url: string) => {
    setStatus("loading");
    try {
      const bodyKeywords: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Cree una lista de palabras clave relevantes para un producto, suponiendo que el objetivo sea mejorar la visibilidad en las búsquedas y atraer tráfico a plataformas de comercio electrónico como eBay, Amazon y MercadoLibre. Proporcione una lista completa de palabras clave, separadas por comas, que describan con precisión el producto y sus características. Tenga en cuenta factores como la categoría del producto, las descripciones y el público objetivo. responde me directamente con el listado de palabras clave.",
                },
                {
                  type: "image_url",
                  image_url: { url },
                },
              ],
            },
          ],
        };

      const bodyDescription: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Genera una descripción para el siguiente producto, para ser utilizada en plataformas de e-commerce como eBay, Amazon y MercadoLibre. La descripción debe ser clara, concisa y atractiva para los compradores potenciales. responde me directamente con la descripción generada. La descripción debe tener la forma de la siguiente plantilla: [Palabras claves del producto] \n [Presentación de la empresa] \n es un [Tipo de Producto] que [Descripción del Producto] . Es ideal para [Público Objetivo - Para que me sirve el Producto] y se destaca por [Características del Producto] \n [Especificaciones técnicas del Producto]. \n Se entrega con [Accesorios del Producto] \n [Garantía del Producto] \n [Políticas de Devolución] \n [Formas de Pago] \n [Lista de todos mis Productos] \n [Preguntas frecuentes] \n Estamos dispuestos para todo lo que necesites \n [Nombre de la Empresa].",
                },
                {
                  type: "image_url",
                  image_url: { url },
                },
              ],
            },
          ],
        };

      const [keywordsResponse, descriptionResponse] = await Promise.all([
        gptQuery(bodyKeywords),
        gptQuery(bodyDescription),
      ]);

      if (keywordsResponse.message && descriptionResponse.message) {
        const keywordsResponseArr = keywordsResponse.message.split(", ");
        const keywords = [];

        for (const keyword of keywordsResponseArr) {
          const message = keyword.trim().replace(/[.,-]/g, "").toLowerCase();
          const k = await suggestionsMutation.mutateAsync(message);
          if ((k?.suggested_queries ?? []).length > 0) {
            keywords.push(message);
            k?.suggested_queries.forEach((suggested_query) => {
              keywords.push(suggested_query.q);
            });
          }
        }

        setKeywords([...new Set(keywords)].join(", "));
        setDescription(descriptionResponse.message);
        setStatus("success");
      }
    } catch (error) {
      console.log(error);
      setStatus("error");
    }
  };

  return { keywords, description, status, generateImageResults };
}
