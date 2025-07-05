import {
  Category,
  CategorySearchResponse,
  SearchResponse,
  SuggestionsResponse,
  TrendsResponse,
} from "@/types/mercadolibreResponses";

export async function getSearches({
  term,
  siteId,
  accessToken,
}: {
  term: string;
  siteId: string;
  accessToken: string;
}): Promise<SearchResponse> {
  try {
    const encodedTerm = encodeURIComponent(term);
    const response = await fetch(
      `/api/user/search?token=${accessToken}&siteId=${siteId}&term=${encodedTerm}&limit=6`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Something went wrong");
    }

    const data: SearchResponse = await response.json();

    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function getSuggestions({
  message,
  siteId,
}: {
  message: string;
  siteId: string;
}): Promise<SuggestionsResponse> {
  try {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://http2.mlstatic.com/resources/sites/${siteId}/autosuggest?showFilters=true&limit=6&api_version=2&q=${encodedMessage}`;

    const response = await fetch(url, {
      headers: {
        Origin: "https://articulo.mercadolibre.com.co",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Something went wrong");
    }

    const data: SuggestionsResponse = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
}

export const getTrends = async ({
  categoryId,
  siteId,
  accessToken,
}: {
  categoryId: string;
  siteId: string;
  accessToken: string;
}): Promise<TrendsResponse[]> => {
  try {
    const response = await fetch(
      `/api/user/trends?token=${accessToken}&siteId=${siteId}&categoryId=${categoryId}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Something went wrong fetching trends"
      );
    }

    const data: TrendsResponse[] = await response.json();

    return data;
  } catch (error) {
    console.log(error);
    throw error instanceof Error ? error : new Error("Unknown error");
  }
};

export const getCategoryById = async ({
  categoryId,
  token,
}: {
  categoryId: string;
  token: string;
}) => {
  try {
    const response = await fetch(
      `/api/user/categories/${categoryId}?token=${token}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Something went wrong fetching category"
      );
    }

    const data: Category = await response.json();

    return data;
  } catch (error) {
    console.log(error);
    throw error instanceof Error ? error : new Error("Unknown error");
  }
};

export const getCategoriesByTerm = async ({
  term,
  siteId,
  token,
}: {
  term: string;
  siteId: string;
  token: string;
}): Promise<CategorySearchResponse[]> => {
  try {
    const encodedTerm = encodeURIComponent(term);
    const response = await fetch(
      `/api/user/categories/search?siteId=${siteId}&term=${encodedTerm}&token=${token}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Something went wrong fetching categories by term"
      );
    }

    const data: CategorySearchResponse[] = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error instanceof Error ? error : new Error("Unknown error");
  }
};

export const getProductDataByUrl = async ({
  productUrl,
}: {
  productUrl: string;
}): Promise<{ categoryTexts: string[] }> => {
  try {
    const encodedUrl = encodeURIComponent(productUrl);
    const response = await fetch(`/api/scrape/product?url=${encodedUrl}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Something went wrong fetching product categories"
      );
    }

    const data: { categoryTexts: string[] } = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error instanceof Error ? error : new Error("Unknown error");
  }
};
