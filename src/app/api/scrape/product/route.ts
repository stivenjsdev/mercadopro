import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
// Use the global fetch provided by the runtime (more compatible with Vercel)

// const EXTENSION_ORIGIN = 'chrome-extension://abc123'; // producción
const EXTENSION_ORIGIN = "*"; // pruebas

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": EXTENSION_ORIGIN, // Permite todos los orígenes
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

// Obtener información relacionada con un producto en MercadoLibre (por ejemplo, su categoría)
// GET /api/scrape/product?url=PRODUCT_URL
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productUrl = searchParams.get("url");

  if (!productUrl) {
    return NextResponse.json({ error: "No 'url' provided" }, { status: 400 });
  }
  console.log("🚀 ~ GET ~ productUrl:", productUrl);

  try {
    // Realizar la solicitud HTTP para obtener el HTML de la página, simulando un navegador real
    // Nota: en Vercel es mejor usar el `fetch` global que importar node-fetch
    const response = await fetch(productUrl, {
      method: "GET",
      // seguir redirecciones
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        Connection: "keep-alive",
        // enviar un referer suele ayudar con algunos sitios
        Referer: productUrl,
      },
    });
    // console.log("🚀 ~ GET ~ response:", response);
    if (!response.ok) {
      // return diagnostic information when the fetch fails
      const text = await response.text().catch(() => "");
      console.error("Fetch failed", { status: response.status, statusText: response.statusText });
      return NextResponse.json(
        { error: `Failed to fetch the URL: ${response.statusText}`, status: response.status, bodySnippet: text.slice(0, 2000) },
        { status: 502 }
      );
    }

    const html = await response.text();
    // Log basic diagnostics to help debug environment differences
    try {
      console.log("Scrape diagnostics:", {
        url: response.url,
        status: response.status,
        contentType: response.headers.get("content-type"),
        length: html.length,
      });
    } catch {
      // ignore logging errors
    }
    // console.log("🚀 ~ GET ~ html:", html);

    // Cargar el HTML en Cheerio
    const $ = cheerio.load(html);

  // Seleccionar el nav con id=":R4dr9jm:" y extraer los textos de los enlaces dentro de los <li>
    const categoryTexts: string[] = [];
    // :R4dr9jm:
    // :R4dracde:
    $('nav[id=":R4drac5e:"] ol > li > a').each((_, element) => {
      const text = $(element).text().trim();
      if (text) {
        categoryTexts.push(text);
      }
    });

    // Si no se encontraron elementos, intentar con el segundo selector
    if (categoryTexts.length === 0) {
      $('nav[id=":R5769gm:"] ol > li > a').each((_, element) => {
        const text = $(element).text().trim();
        if (text) {
          categoryTexts.push(text);
        }
      });
    }
    // Si no se encontraron elementos, intentar con el segundo selector
    if (categoryTexts.length === 0) {
      $('nav[id=":R2jj97de:"] ol > li > a').each((_, element) => {
        const text = $(element).text().trim();
        if (text) {
          categoryTexts.push(text);
        }
      });
    }
    // Si aún no se encontraron elementos, intentar con el tercer selector
    if (categoryTexts.length === 0) {
      $('nav[id=":R5769hm:"] ol > li > a').each((_, element) => {
        const text = $(element).text().trim();
        if (text) {
          categoryTexts.push(text);
        }
      });
    }

    // Diagnostics: check whether the fetched HTML actually contains <html> or indicates blocking
    const lowerHtml = html.toLowerCase();
    const hasHtmlTag = /<\s*!doctype|<\s*html/.test(lowerHtml);
    const possibleBlockers = ["cloudflare", "bot", "captcha", "denied", "forbidden", "access denied"];
    const blockerFound = possibleBlockers.find((term) => lowerHtml.includes(term));

    const bodySnippet = html.slice(0, 2000);

    if (!hasHtmlTag || blockerFound) {
      // Return extra diagnostic info so you can inspect what the server saw on Vercel
      return NextResponse.json(
        {
          categoryTexts,
          diagnostic: {
            hasHtmlTag,
            blockerFound: blockerFound || null,
            contentType: response.headers.get("content-type"),
            length: html.length,
            bodySnippet,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ categoryTexts, bodySnippet }, { status: 200 });
  } catch (error) {
    console.error("Error scraping product data:", error);
    return NextResponse.json(
      { error: "Failed to scrape product data" },
      { status: 500 }
    );
  }
}
