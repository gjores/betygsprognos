"use server"

import prisma from "@/lib/prisma"
import { importStudieplanerKurserFromPath, importStudieplanerKurserFromString } from "@/lib/importer"

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File
  if (!file) return { error: "No file uploaded" }

  const arrayBuf = await file.arrayBuffer()
  const text = new TextDecoder("utf-8").decode(arrayBuf)
  const result = await importStudieplanerKurserFromString(text)
  return { success: true, ...result }
}

export async function importSample() {
  const result = await importStudieplanerKurserFromPath("public/StudieplanerKurser.txt")
  return { success: true, ...result }
}

// Wrappers compatible with useFormState/useActionState
export async function uploadFileAction(_prevState: any, formData: FormData) {
  return uploadFile(formData)
}

export async function importSampleAction(_prevState: any, _formData: FormData) {
  return importSample()
}
