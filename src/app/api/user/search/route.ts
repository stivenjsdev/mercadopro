import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");
  const term = searchParams.get("term");

  if (!siteId) {
    return NextResponse.json({ error: "No siteId provided" }, { status: 400 });
  }

  try {
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
