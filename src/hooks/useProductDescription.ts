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
                  text: `Crear una descripción de producto en español para una plataforma de venta online. El nombre del producto es ${productName}. Siga la plantilla proporcionada para generar una descripción del producto clara, concisa y atractiva. Cada punto de la plantilla debe ser separado con multiples - ó / ó *. La plantilla incluye:
                  # **Descripción del producto**
                  [No agregues ningún contenido en esta sección, y pasa al siguiente punto]
                  ## **Palabras claves**
                  [No agregues ninguna palabra clave, ya que la persona las agregará manualmente, pero si adiciona el siguiente texto predefinido que no es una instrucción para ti] 
                  [Texto predefinido: Agrega las palabras claves generadas previamente, máximo 4 líneas]
                  ## **Descripción del producto
                  [Genera una descripción completa de las características, ventajas y beneficios del producto]
                  ## **Características del producto**
                  [Destaque las características más importantes y claves que distinguen al producto]
                  ## **Especificaciones técnicas**
                  [Incluya las especificaciones y detalles técnicos más relevantes del producto, como dimensiones, materiales, peso, certificaciones, etc.]
                  ## **Accesorios del producto**
                  [Enumere los accesorios, complementos, artículos adicionales o productos relacionados que se incluyen con la compra]
                  ## **Políticas de devolución**
                  [Describa las políticas de devolución, garantía, cambios y reembolso aplicables al producto]
                  [Texto predefinido: Devoluciones fáciles en 30 días, reembolso completo o cambio (excepto para productos de ropa íntima)]
                  ## **Métodos de pago**
                  [Enumere los métodos de pago aceptados]
                  [Texto predefinido: Aceptamos tarjetas de crédito, débito, Mercadopago, Efecty y PSE]
                  ## **Preguntas frecuentes**
                  [Texto predefinido: P: ¿Se paga contra reembolso? R: No, sólo aceptamos pagos por adelantado.]
                  [Texto predefinido: P: ¿Cuánto tarda en llegar mi pedido? R: En el detalle de tu compra, puedes ver el tiempo estimado de envío a tu localidad.]
                  [Además de lsa anteriores, Enumere las preguntas frecuentes más comunes y sus respuestas]
                  ## **Nombre de empresa**
                  [Ligera presentación de la empresa, permitiendo un espacio de Inserte nombre de empresa, y termine con una llamada a la acción].`,
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
