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

// Obtener tendencias de MercadoLibre
// GET /api/user/trends?token=ACCESS_TOKEN&siteId=SITE_ID&categoryId=CATEGORY_ID
export async function GET(request: Request) {
  // Obtener el token de acceso, el siteId y el categoryId de la URL
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const siteId = searchParams.get("siteId");
  const categoryId = searchParams.get("categoryId");

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 });
  }

  try {
    // Hacer una solicitud a la API de MercadoLibre para obtener tendencias
    const response = await fetch(
      `https://api.mercadolibre.com/trends/${siteId}/${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 404) {
      return Response.json(
        { error: `Trend with category id ${categoryId} not found` },
        { status: 404 }
      );
    }

    console.log(response.status);
    if (!response.ok) {
      const errorData = await response.text();
      console.error("MercadoLibre API error:", errorData);
      throw new Error("Failed to fetch trends");
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": EXTENSION_ORIGIN,
      },
    });
  } catch (error) {
    console.error("Error fetching trends:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
