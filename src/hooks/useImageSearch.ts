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
                  text: "**Generar una descripción de producto para una plataforma de venta online** Por favor, cree una descripción clara, concisa y atractiva para el siguiente producto: **Palabras clave del producto**: Palabras clave exactas del producto (por ejemplo, «Anillo de diamantes», «Cafetera», etc.) **Presentación de la empresa**: Describa brevemente su empresa y sus valores (por ejemplo, «Fundada en 2010, somos una empresa familiar dedicada a ofrecer productos de alta calidad»). **Tipo de producto**: Identifique la categoría o tipo de producto (por ejemplo, «joyería», «electrodoméstico de cocina», etc.) **Descripción del producto**: Proporcione un breve resumen de las características y ventajas del producto (por ejemplo, «Un impresionante anillo de diamantes de 14 quilates, perfecto para cualquier ocasión especial») **Público objetivo**: Defina claramente el público al que va dirigido el producto (por ejemplo, «Parejas que celebran aniversarios o compromisos», «Amantes del café que buscan una cafetera de alta calidad»). **Características del producto**: Destaque las características clave que distinguen al producto (por ejemplo, «Diamante de alta calidad, diseño duradero, fácil de ajustar»). **Especificaciones técnicas**: Incluya cualquier detalle técnico relevante, como dimensiones, materiales o certificaciones (por ejemplo, «Oro de 14 quilates, 0,5 quilates, diamante libre de conflictos»). **Accesorios del producto**: Mencione cualquier artículo adicional incluido con el producto (por ejemplo, «Caja de regalo de lujo, paño de pulido»). **Garantía del producto**: Describa las condiciones de la garantía, incluida la duración y la cobertura (por ejemplo, «1 año de garantía, 30 días de garantía de devolución del dinero») **Política de devoluciones**: Especifique las políticas de devolución y cambio (por ejemplo, «Devoluciones fáciles en 30 días, reembolso completo o cambio») **Métodos de pago**: Enumere los métodos de pago aceptados (por ejemplo, «Tarjetas de crédito, PayPal, transferencia bancaria») **Preguntas frecuentes**: Sugiera incluir una sección con preguntas y respuestas frecuentes (por ejemplo, «P: ¿El diamante está libre de conflictos? R: Sí, nuestros diamantes son 100% libres de conflicto) **Nombre de la empresa**: Incluya el nombre de su empresa y una llamada a la acción (por ejemplo, «Póngase en contacto con nosotros en [Nombre de su empresa] para cualquier pregunta o duda»). Responda con la descripción del producto generada utilizando esta plantilla.",
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
