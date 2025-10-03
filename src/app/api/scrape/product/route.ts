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
        // additional headers commonly sent by browsers — may help avoid simple bot checks
        "Sec-CH-UA": '"Chromium";v="125", "Google Chrome";v="125", ";Not A Brand";v="99"',
        "Sec-CH-UA-Mobile": '?0',
        "Sec-CH-UA-Platform": '"Windows"',
        "Sec-Fetch-Site": 'none',
        "Sec-Fetch-Mode": 'navigate',
        "Sec-Fetch-User": '?1',
        "Sec-Fetch-Dest": 'document',
        "Upgrade-Insecure-Requests": '1',
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

    // --- Attempt to extract static data from the page before relying on DOM selectors ---
    // 1) JSON-LD (<script type="application/ld+json">)
    const categoryTexts: string[] = [];
    try {
      $('script[type="application/ld+json"]').each((_, el) => {
        const raw = $(el).contents().text();
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          // JSON-LD can be an array or object
          const items = Array.isArray(parsed) ? parsed : [parsed];
          for (const it of items) {
            if (it['@type'] === 'BreadcrumbList' && Array.isArray(it.itemListElement)) {
              for (const entry of it.itemListElement) {
                if (entry.name) categoryTexts.push(String(entry.name).trim());
                else if (entry.item && entry.item.name) categoryTexts.push(String(entry.item.name).trim());
              }
            }
            // Some sites include product/category information in other JSON-LD types
            if (it['@type'] && String(it['@type']).toLowerCase().includes('product') && it.category) {
              if (Array.isArray(it.category)) categoryTexts.push(...(it.category as unknown[]).map((c) => String(c)));
              else categoryTexts.push(String(it.category));
            }
          }
        } catch {
          // ignore parse errors
        }
      });
    } catch {
      // ignore errors
    }

    // 2) Embedded JSON in inline scripts (common patterns)
    if (categoryTexts.length === 0) {
      try {
        const patterns = [
          /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\})\s*;?/m,
          /window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\})\s*;?/m,
          /var\s+__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\})\s*;?/m,
          /dataLayer\s*=\s*(\[[\s\S]*?\])\s*;?/m,
        ];
        for (const pat of patterns) {
          const m = pat.exec(html);
          if (m && m[1]) {
            try {
              const obj = JSON.parse(m[1]);
              // recursively search for likely breadcrumb/category keys
              const found: string[] = [];
              const keysToFind = ['breadcrumb', 'breadcrumbs', 'categories', 'path_from_root', 'category_name', 'category', 'category_id', 'category_path'];
              const search = (o: unknown) => {
                if (!o || typeof o !== 'object') return;
                if (Array.isArray(o)) {
                  for (const v of o) search(v);
                  return;
                }
                for (const k of Object.keys(o)) {
                  const low = k.toLowerCase();
                  const record = o as Record<string, unknown>;
                  if (keysToFind.includes(low)) {
                    const val = record[k];
                    if (typeof val === 'string') found.push(val.trim());
                    else if (Array.isArray(val)) {
                      for (const vv of val) {
                        if (typeof vv === 'string') found.push(vv.trim());
                        else if (vv && vv.name) found.push(String(vv.name).trim());
                      }
                    } else if (val && typeof val === 'object') {
                      const valRec = val as Record<string, unknown>;
                      if ('name' in valRec && typeof valRec.name === 'string') found.push(String(valRec.name).trim());
                      else search(valRec);
                    }
                  } else {
                    search(record[k]);
                  }
                }
              };
              search(obj);
              if (found.length) {
                categoryTexts.push(...found);
                break;
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch {
        // ignore
      }
    }

    // If still empty, proceed to Cheerio selectors below

  // Seleccionar el nav con id=":R4dr9jm:" y extraer los textos de los enlaces dentro de los <li>
    // If JSON-LD/embedded JSON didn't populate categoryTexts, fall back to DOM scraping
    if (categoryTexts.length === 0) {
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
    }

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
