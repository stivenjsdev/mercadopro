import { useKeywords } from "@/hooks/useKeywords";
import { gptQuery } from "@/services/gptApi";
import { Status } from "@/types/formsData";
import { OpenAI } from "openai";
import { useState } from "react";

export default function useProductDescription() {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("success");
  const {
    keywords,
    status: imageStatus,
    generateKeywordsByImageUrl,
  } = useKeywords();

  const generateKeywordsAndSuggestedDescription = async (
    productName: string,
    url: string,
    siteId: string
  ) => {
    setStatus("loading");
    try {
      const bodyDescription: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Crear una descripción de producto en español para una plataforma de venta online. El nombre del producto es ${productName}. Siga la plantilla proporcionada para generar una descripción del producto clara, concisa y atractiva. La plantilla incluye: **Palabras clave**: [Insertar palabras clave generadas previamente, máximo 4 líneas]. **Descripción del producto**: (Generar una descripción completa de las características y ventajas del producto) **Características del producto**: (Destaque las características clave que distinguen al producto) **Especificaciones técnicas**: (Incluya detalles técnicos relevantes, como dimensiones, materiales o certificaciones) **Accesorios del producto**: (Enumere los artículos adicionales incluidos con el producto, por ejemplo, «Caja de regalo de lujo, paño de pulido») **Política de devoluciones**: (Especifique la política de cambios y devoluciones, por ejemplo, «Devoluciones fáciles en 30 días, reembolso completo o cambio (excepto para productos de ropa íntima)») **Métodos de pago**: (Enumere los métodos de pago aceptados, por ejemplo, «Tarjetas de crédito, débito, Mercadopago, Efecty, PSE») **Preguntas frecuentes**: (Sugiera incluir una sección con preguntas y respuestas frecuentes, que incluya las siguientes preguntas estándar) * P: ¿Se paga contra reembolso? R: No, sólo aceptamos pagos por adelantado. * P: ¿Cuánto tarda en llegar mi pedido? R: En el detalle de tu compra, puedes ver el tiempo estimado de envío a tu localidad **Nombre de la empresa**: {Nombre de la empresa}, con una llamada a la acción. Por favor, asegúrese de que la descripción generada es precisa, concisa y atractiva, y sigue la plantilla proporcionada, donde los [] simbolizan texto que no debes generar si no que va fijo en la plantilla. Responda directamente con la descripción Separa cada uno de los puntos con multiples - ó / ó *`,
                },
                {
                  type: "image_url",
                  image_url: { url },
                },
              ],
            },
          ],
        };

      const [{ message }] = await Promise.all([
        gptQuery(bodyDescription),
        generateKeywordsByImageUrl(url, productName, siteId),
      ]);
      if (!message) {
        setStatus("error");
        return;
      }
      console.log("descripción generada: ", message);
      setDescription(message);
      setStatus("success");
    } catch (error) {
      console.log(error);
      setStatus("error");
    }
  };

  return {
    keywords,
    description,
    status,
    imageStatus,
    generateKeywordsAndSuggestedDescription,
  };
}
