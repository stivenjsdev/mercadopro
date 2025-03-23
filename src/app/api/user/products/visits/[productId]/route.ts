import { NextResponse } from "next/server";

type Params = {
  productId: string;
};

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

// Obtener las visitas totales de un Producto de MercadoLibre
// GET /api/user/products/visits/[productId]
export async function POST(request: Request, { params }: { params: Params }) {
  const { productId } = params;
  const { token, dateFrom, dateTo } = await request.json();

  //  fechas: año-mes-día

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 });
  }
  if (!dateFrom) {
    return NextResponse.json(
      { error: "No dateFrom provided" },
      { status: 400 }
    );
  }
  if (!dateTo) {
    return NextResponse.json({ error: "No dateTo provided" }, { status: 400 });
  }

  try {
    // Hacer una solicitud a la API de MercadoLibre para obtener el producto
    const response = await fetch(
      `https://api.mercadolibre.com/items/visits?ids=${productId}&date_from=${dateFrom}&date_to=${dateTo}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response.status);
    if (!response.ok) {
      const errorData = await response.text();
      console.error("MercadoLibre API error:", errorData);
      throw new Error("Failed to fetch product");
    }

    const data = await response.json();
    /**
     * data = [
      {
        "item_id": "MCO615863870",
        "date_from": "2025-03-01T00:00:00Z",
        "date_to": "2025-03-15T00:00:00Z",
        "total_visits": 36,
        "visits_detail": [
            {
                "company": "mercadolibre",
                "quantity": 36
            }
        ]
      }
    ]
     */
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": EXTENSION_ORIGIN,
      },
    });
  } catch (error) {
    console.error("Error fetching Product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
