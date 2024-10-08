import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch(
      "https://api.mercadolibre.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.NEXT_PUBLIC_MERCADOLIBRE_CLIENT_ID!,
          client_secret: process.env.NEXT_PUBLIC_MERCADOLIBRE_CLIENT_SECRET!,
          code: code,
          redirect_uri: process.env.NEXT_PUBLIC_MERCADOLIBRE_REDIRECT_URI!,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(
        `Failed to exchange code for token ${tokenResponse.status}`
      );
    }

    const tokenData = await tokenResponse.json();

    // Obtener la URL base de la aplicación
    const baseUrl = getBaseUrl(request.url);

    // Redirigir al cliente con el token como parámetro de consulta
    return NextResponse.redirect(
      new URL(`${baseUrl}/?token=${tokenData.access_token}`)
    );
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return NextResponse.json(
      { error: `Internal server error. ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

function getBaseUrl(url: string): string {
  const parsedUrl = new URL(url);
  const host = parsedUrl.host;

  // Verificar si es una URL de vista previa de Netlify
  if (host.includes("--")) {
    const [deployId, ...rest] = host.split("--");
    return `https://${deployId}--${rest.join("--")}`;
  }

  // URL de producción o desarrollo local
  return `${parsedUrl.protocol}//${host}`;
}
