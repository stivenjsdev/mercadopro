export type TermFormData = {
  productName: string;
  imageUrl: string;
};

export type ImageFormData = {
  productName: string;
  url: string;
};

export type LoginFormData = {
  country: string;
};

export type Status = "loading" | "success" | "error";
