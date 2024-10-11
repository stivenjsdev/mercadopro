import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const siteId = searchParams.get("siteId");
  const categoryId = searchParams.get("categoryId");

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 });
  }

  try {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching trends:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
