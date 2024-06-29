import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatChatId(ids: [string | undefined, string | undefined]) {
  const sortedIds = ids.sort();

  return sortedIds.join("--");
}
