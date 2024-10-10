type Params = {
  categoryId: string;
};

export async function GET(request: Request, { params }: { params: Params }) {
  const { categoryId } = params;

  if (!categoryId) {
    return Response.json({ error: "No categoryId provided" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.mercadolibre.com/categories/${categoryId}`
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
    return Response.json({ category });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
