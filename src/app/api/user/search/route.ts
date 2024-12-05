import { NextResponse } from "next/server";

// Obtener resultados de búsqueda de MercadoLibre
// GET /api/search?siteId=SITE_ID&term=SEARCH_TERM
export async function GET(request: Request) {
  // Obtener el siteId y el término de búsqueda de la URL
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");
  const term = searchParams.get("term");

  if (!siteId) {
    return NextResponse.json({ error: "No siteId provided" }, { status: 400 });
  }

  try {
    // Hacer una solicitud a la API de MercadoLibre para obtener resultados de búsqueda
    const response = await fetch(
      `https://api.mercadolibre.com/sites/${siteId}/search?q=${term}&limit=6`
    );

    console.log(response.status);
    if (!response.ok) {
      const errorData = await response.text();
      console.error("MercadoLibre API error:", errorData);
      throw new Error("Failed to fetch searches");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching searches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
