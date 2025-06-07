type Params = {
  categoryId: string;
};

// Obtener información de una categoría por su ID
// GET /api/user/categories/[categoryId]?token=ACCESS_TOKEN
export async function GET(request: Request, { params }: { params: Params }) {
  const { categoryId } = params;
  // Obtener token de la URL
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!categoryId) {
    return Response.json({ error: "No categoryId provided" }, { status: 400 });
  }
  if (!token) {
    return Response.json({ error: "No token provided" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.mercadolibre.com/categories/${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 404) {
      return Response.json(
        { error: `Category with id ${categoryId} not found` },
        { status: 404 }
      );
    }
    if (!response.ok) {
      throw new Error("Failed to fetch category data");
    }
    const category = await response.json();
    return Response.json(category);
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
