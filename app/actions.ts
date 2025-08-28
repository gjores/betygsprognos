"use server"

import prisma from "@/lib/prisma"
import { importStudieplanerKurserFromPath, importStudieplanerKurserFromString, importStudieplanerKurserFromXMLString } from "@/lib/importer"
import { decodeMaybeLatin1 } from "@/lib/encoding"

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

export async function importXMLFile(_prevState: any, formData: FormData) {
  const file = formData.get("file") as File | null
  if (!file) return { error: "Ingen fil vald" }
  const name = file.name?.toLowerCase() || ""
  if (!name.endsWith(".xml")) {
    return { error: "Fel filtyp. Välj en XML‑fil." }
  }
  const buf = await file.arrayBuffer()
  const text = decodeMaybeLatin1(buf)
  const result = await importStudieplanerKurserFromXMLString(text)
  return { success: true, ...result }
}
