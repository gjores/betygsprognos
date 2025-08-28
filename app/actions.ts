"use server"

import prisma from "@/lib/prisma"
import { importStudieplanerKurserFromPath, importStudieplanerKurserFromString } from "@/lib/importer"

export async function importSample() {
  const result = await importStudieplanerKurserFromPath("public/StudieplanerKurser.txt")
  return { success: true, ...result }
}

// Wrappers compatible with useFormState/useActionState

export async function importSampleAction(_prevState: any, _formData: FormData) {
  return importSample()
}

export async function importPasted(_prevState: any, formData: FormData) {
  const data = formData.get("data")
  if (!data || typeof data !== "string")
    return { error: "Ingen data inklistrad" }

  const result = await importStudieplanerKurserFromString(data)
  return { success: true, ...result }
}
