"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginWithPassword(_prevState: { error?: string } | undefined, formData: FormData) {
  const password = formData.get("password")?.toString() ?? "";
  
  if (!password) {
    return { error: "Password is required." };
  }

  if (password === process.env.MASTER_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("lv_auth", "ok", { httpOnly: true, sameSite: "lax" });
    redirect("/dashboard");
  }
  
  return { error: "Incorrect master password." };
}
