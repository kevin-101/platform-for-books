"use server";

import { revalidatePath } from "next/cache";

export async function revalidateFriends() {
  revalidatePath("/dashboard/friends");
}
