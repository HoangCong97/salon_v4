export interface Branch {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  brandName?: string;
  slogan?: string;
  logoUrl?: string;
  bannerUrl?: string;
  hotline?: string;
  fanpageUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  websiteUrl?: string;
}

export type ModalMode = "create" | "edit";

export interface TenantInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  brandName?: string;
  slogan?: string;
  logoUrl?: string;
  bannerUrl?: string;
  hotline?: string;
  fanpageUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  websiteUrl?: string;
}
