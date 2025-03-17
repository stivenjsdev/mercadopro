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

// Después de que el token de acceso expira, el cliente puede solicitar un nuevo token de acceso utilizando el token de actualización
// POST /api/auth/refresh
export async function POST(request: Request) {
  // Obtener el token de actualización del cuerpo de la solicitud
  const { refresh_token } = await request.json();

  if (!refresh_token) {
    return NextResponse.json(
      { error: "No refresh token provided" },
      { status: 400 }
    );
  }

  try {
    // Intercambiar el token de actualización por un nuevo token de acceso
    const tokenResponse = await fetch(
      "https://api.mercadolibre.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: process.env.NEXT_PUBLIC_MERCADOLIBRE_CLIENT_ID!,
          client_secret: process.env.MERCADOLIBRE_CLIENT_SECRET!,
          refresh_token: refresh_token,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to refresh token");
    }

    const tokenData = await tokenResponse.json();
    return NextResponse.json(tokenData, {
      headers: {
        "Access-Control-Allow-Origin": EXTENSION_ORIGIN, // Permite todos los orígenes
      },
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
