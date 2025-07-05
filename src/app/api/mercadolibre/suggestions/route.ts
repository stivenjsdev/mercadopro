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
    const response = await fetch(url, {
      headers: {
        Origin: "https://articulo.mercadolibre.com.co",
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
