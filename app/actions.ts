"use server"

import prisma from "@/lib/prisma"

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File
  if (!file)
    return { error: "No file uploaded" }

  // TODO: implement file handling using Prisma
  return { success: true }
}
