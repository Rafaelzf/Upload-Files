import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileUrl(fileId: string) {
  const baseURL = process.env.NEXT_PUBLIC_CONVEX_URL;
  const siteURL = baseURL?.replace(".cloud", ".site");
  const getImageUrl = new URL(`${siteURL}/getImage`);
  getImageUrl.searchParams.set("storageId", fileId);
  return getImageUrl.href;
}
