import { CategorySearchResponse } from "@/types/mercadolibreResponses";
import { NextResponse } from "next/server";

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

// Obtener categorías relacionadas con un término de búsqueda en MercadoLibre
// GET /api/user/categories/search?siteId=SITE_ID&term=SEARCH_TERM
export async function GET(request: Request) {
  // Obtener el siteId y el término de búsqueda de la URL
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");
  const term = searchParams.get("term");
  // Note: el endpoint de MELI puede tener un limit pero seria innecesario para el objetivo.

  if (!siteId) {
    return NextResponse.json({ error: "No siteId provided" }, { status: 400 });
  }
  if (!term) {
    return NextResponse.json({ error: "No term provided" }, { status: 400 });
  }

  try {
    // Hacer una solicitud a la API de MercadoLibre para obtener categorías relacionadas
    const response = await fetch(
      `https://api.mercadolibre.com/sites/${siteId}/domain_discovery/search?q=${encodeURIComponent(
        term
      )}`
    );

    console.log(response.status);
    if (!response.ok) {
      const errorData = await response.text();
      console.error("MercadoLibre API error:", errorData);
      throw new Error("Failed to fetch categories");
    }

    const data: CategorySearchResponse[] = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": EXTENSION_ORIGIN,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
