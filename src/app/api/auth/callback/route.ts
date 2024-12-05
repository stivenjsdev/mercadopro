import { NextResponse } from "next/server";

// Después de que el usuario inicia sesión en MercadoLibre, MercadoLibre redirige al usuario a esta ruta con un código de autorización
// GET /api/auth/callback?code=AUTHORIZATION_CODE
export async function GET(request: Request) {
  // Obtener el código de autorización de la URL
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Verificar si se proporcionó un código, de lo contrario, devolver un error 400 No Code provided
  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    // Intercambiar el código de autorización por un token de acceso
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
          client_secret: process.env.MERCADOLIBRE_CLIENT_SECRET!,
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

    // Codificar los datos del token en base64
    const encodedTokenData = btoa(JSON.stringify(tokenData));

    // Obtener la URL base de la aplicación
    const baseUrl = getBaseUrl(request.url);

    // Redirigir al cliente con el token como parámetro de consulta
    return NextResponse.redirect(
      new URL(`${baseUrl}/?token=${encodedTokenData}`)
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
    console.log(deployId, rest);
    return `https://${rest.join("--")}`;
  }

  // URL de producción o desarrollo local
  return `${parsedUrl.protocol}//${host}`;
}
