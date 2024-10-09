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
                  text: `**Generar una descripción de producto en ESPAÑOL para una plataforma de venta online, El nombre del producto es:${productName}** Por favor, cree una descripción clara, concisa y atractiva para el siguiente producto: **Descripción del producto**: Proporcione una completa descripción con las características y ventajas del producto (por ejemplo, «Un impresionante anillo de diamantes de 14 quilates, perfecto para cualquier ocasión especial»). **Características del producto**: Destaque las características clave que distinguen al producto (por ejemplo, «Diamante de alta calidad, diseño duradero, fácil de ajustar»). **Especificaciones técnicas**: Incluya cualquier detalle técnico relevante, como dimensiones, materiales o certificaciones (por ejemplo, «Oro de 14 quilates, 0,5 quilates, diamante libre de conflictos»). **Accesorios del producto**: Mencione cualquier artículo adicional incluido con el producto (por ejemplo, «Caja de regalo de lujo, paño de pulido»). **Política de devoluciones**: Especifique las políticas de devolución y cambio (siempre serán 30 días, y productos de uso intimo no tienen devolución, por ejemplo, «Devoluciones fáciles en 30 días, reembolso completo o cambio») **Métodos de pago**: Enumere los métodos de pago aceptados (siempre serán y unicamente, mercadopago, efecty, pse, tarjeta de crédito y débito, por ejemplo, «Tarjetas de crédito, Mercadopago, Efecty, PSE, Débito») **Preguntas frecuentes**: Sugiera incluir una sección con preguntas y respuestas frecuentes (por ejemplo, «P: ¿El diamante está libre de conflictos? R: Sí, nuestros diamantes son 100% libres de conflicto) (incluye siempre las siguientes preguntas ya que son estándares pero ajusta las para ser mas profesionales, y no dejes de incluir varias preguntas generadas por ti: «P: ¿Pago contra entrega? R: No», «P: ¿Cuanto demora en llegar mi pedido? R: En el detalle de tu compra puedes ver el tiempo estimado de envío hacia tu ubicación») **Nombre de la empresa**: Incluya el nombre de su empresa y una llamada a la acción (por ejemplo, «Póngase en contacto con nosotros en [Nombre de su empresa] para cualquier pregunta o duda»). Responda con la descripción del producto generada utilizando esta plantilla. Separa cada uno de los puntos con multiples - ó / ó *`,
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
      console.log("useProductDescription -> message:", message);
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
