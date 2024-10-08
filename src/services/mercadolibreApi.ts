import {
  SearchResponse,
  SuggestionsResponse,
  TrendsResponse,
} from "@/types/mercadolibreResponses";

export async function getSearches({
  term,
  siteId,
}: {
  term: string;
  siteId: string;
}): Promise<SearchResponse> {
  try {
    const encodedTerm = encodeURIComponent(term);
    const response = await fetch(
      `https://api.mercadolibre.com/sites/${siteId}/search?q=${encodedTerm}&limit=6`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Something went wrong");
    }

    const data: SearchResponse = await response.json();

    return data;
  } catch (error) {
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
    console.log({ message });
    const encodedMessage = encodeURIComponent(message);
    const url = `https://http2.mlstatic.com/resources/sites/${siteId}/autosuggest?showFilters=true&limit=6&api_version=2&q=${encodedMessage}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Something went wrong");
    }

    const data: SuggestionsResponse = await response.json();
    return data;
  } catch (error) {
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
      throw new Error("Error fetching trends");
    }

    const data: TrendsResponse[] = await response.json();

    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Unknown error");
  }
};
