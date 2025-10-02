import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import fetch from "node-fetch"; // Asegúrate de instalar esta dependencia

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
    const response = await fetch(productUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        Connection: "keep-alive",
      },
    });
    // console.log("🚀 ~ GET ~ response:", response);
    if (!response.ok) {
      throw new Error(`Failed to fetch the URL: ${response.statusText}`);
    }
    const html = await response.text();
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
    // Si aún no se encontraron elementos, intentar con el tercer selector
    if (categoryTexts.length === 0) {
      $('nav[id=":R5769hm:"] ol > li > a').each((_, element) => {
        const text = $(element).text().trim();
        if (text) {
          categoryTexts.push(text);
        }
      });
    }

    return NextResponse.json({ categoryTexts }, { status: 200 });
  } catch (error) {
    console.error("Error scraping product data:", error);
    return NextResponse.json(
      { error: "Failed to scrape product data" },
      { status: 500 }
    );
  }
}
