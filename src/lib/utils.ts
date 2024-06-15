import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatChatId(ids: string[]) {
  const sortedIds = ids.sort();

  return sortedIds.join("--");
}
