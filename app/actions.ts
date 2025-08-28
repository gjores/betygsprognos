"use server"

import prisma from "@/lib/prisma"
import { importStudieplanerKurserFromPath, importStudieplanerKurserFromString, importStudieplanerKurserFromXMLString, computeRiskFromXML } from "@/lib/importer"
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

// Huvudman: process multiple XML files with provided school names in one go
export async function computeHeadOverview(_prevState: any, formData: FormData) {
  const threshold = Number(formData.get("threshold") ?? 250)
  const activeOnly = (formData.get("activeOnly") ?? "0") === "1"
  const names = formData.getAll("schoolName").map((v) => String(v || "").trim())
  const files = formData.getAll("schoolFile") as (File | null)[]
  const results: { school: string; total: number; atRisk: number; pct: number }[] = []
  const errors: string[] = []

  const count = Math.max(names.length, files.length)
  for (let i = 0; i < count; i++) {
    const name = names[i] || `Skola ${i + 1}`
    const file = files[i]
    if (!file) {
      continue
    }
    if (!file.name?.toLowerCase().endsWith(".xml")) {
      errors.push(`${name}: fel filtyp (måste vara XML)`)
      continue
    }
    const buf = await file.arrayBuffer()
    const xml = decodeMaybeLatin1(buf)
    const { total, atRisk } = computeRiskFromXML(xml, Number.isFinite(threshold) ? threshold : 250, activeOnly)
    const pct = total > 0 ? Math.round((atRisk / total) * 1000) / 10 : 0
    results.push({ school: name, total, atRisk, pct })
  }

  // Sort desc by pct
  results.sort((a, b) => b.pct - a.pct)
  return { success: true, results, errors }
}

// Danger: Clear all data in the local database
export async function clearAllData(_prevState?: any, _formData?: FormData) {
  await prisma.$transaction([
    prisma.enrollment.deleteMany({}),
    prisma.course.deleteMany({}),
    prisma.student.deleteMany({}),
  ])
  return { ok: true }
}
