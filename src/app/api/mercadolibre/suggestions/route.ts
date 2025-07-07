import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const message = searchParams.get("message");
  const siteId = searchParams.get("siteId");
  if (!message || !siteId) {
    return NextResponse.json(
      { error: "Missing message or siteId" },
      { status: 400 }
    );
  }
  const encodedMessage = encodeURIComponent(message);
  const url = `https://http2.mlstatic.com/resources/sites/${siteId}/autosuggest?showFilters=true&limit=6&api_version=2&q=${encodedMessage}`;
  try {
    // Mapeo de siteId a dominio de origen
    const siteOrigins: Record<string, string> = {
      MLA: "https://articulo.mercadolibre.com.ar",
      MLB: "https://articulo.mercadolivre.com.br",
      MCO: "https://articulo.mercadolibre.com.co",
      MCR: "https://articulo.mercadolibre.co.cr",
      MLC: "https://articulo.mercadolibre.cl",
      MLM: "https://articulo.mercadolibre.com.mx",
      MLU: "https://articulo.mercadolibre.com.uy",
      MLV: "https://articulo.mercadolibre.com.ve",
      MPE: "https://articulo.mercadolibre.com.pe",
      MPA: "https://articulo.mercadolibre.com.pa",
      MBO: "https://articulo.mercadolibre.com.bo",
      MGT: "https://articulo.mercadolibre.com.gt",
      MHN: "https://articulo.mercadolibre.com.hn",
      MNI: "https://articulo.mercadolibre.com.ni",
      MSV: "https://articulo.mercadolibre.com.sv",
      MPY: "https://articulo.mercadolibre.com.py",
      MDC: "https://articulo.mercadolibre.com.do",
      MEC: "https://articulo.mercadolibre.com.ec",
    };
    const origin = siteOrigins[siteId] || "https://www.mercadolibre.com";
    const response = await fetch(url, {
      headers: {
        Origin: origin,
      },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
