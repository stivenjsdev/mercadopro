import { UserInfo } from "@/types/mercadolibreResponses";
import { TokenData } from "@/types/tokenData";

export const fetchUserInfo = async (token: string): Promise<UserInfo> => {
  const response = await fetch(`/api/user/me?token=${token}`);
  if (!response.ok) {
    throw new Error("Error fetching user info");
  }
  return response.json();
};

export const refreshToken = async (
  refreshToken: string
): Promise<TokenData> => {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Error refreshing token");
  }

  return response.json();
};
