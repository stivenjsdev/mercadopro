export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  scope: string;
  token_type: string;
  user_id: number;
}
