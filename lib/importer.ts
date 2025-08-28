import prisma from "@/lib/prisma"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { decodeMaybeLatin1 } from "@/lib/encoding"

type Row = Record<string, string>

function parseIntOrNull(v?: string): number | null {
  if (!v) return null
  const n = Number.parseInt(v, 10)
  return Number.isNaN(n) ? null : n
}

function parseBool(v?: string): boolean {
  return v === "1" || v?.toLowerCase() === "true"
}

function parseDateOrNull(v?: string): Date | null {
  if (!v) return null
  // Expect YYYY-MM-DD; ignore invalid
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

function parseTSV(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []
  const headers = lines[0]
    .split("\t")
    .map((h) => h.replace(/^\uFEFF/, "").trim().toLowerCase())
  const rows: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split("\t")
    const row: Row = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (cols[j] ?? "").trim()
    }
    rows.push(row)
  }
  return rows
}

export async function importStudieplanerKurserFromString(text: string) {
  const rows = parseTSV(text)
  if (rows.length === 0) return { students: 0, courses: 0, enrollments: 0 }

  const studentMap = new Map<number, {
    id: number
    socialNumber: string
    firstName: string
    lastName: string
    sex?: string
    class?: string
    gradeClass?: string
    gradeProgram?: string
    gradeProgramCode?: string
  }>()

  const courseMap = new Map<string, {
    id: string
    specialization?: string
    points: number
    category?: string
  }>()

  const enrollments: any[] = []

  for (const r of rows) {
    const sid = parseIntOrNull(r["studentid"]) ?? undefined
    const courseId = r["course"]?.trim()
    if (!sid || !courseId) continue

    // Students
    if (!studentMap.has(sid)) {
      studentMap.set(sid, {
        id: sid,
        socialNumber: r["socialnumber"] ?? "",
        firstName: r["fname"] ?? "",
        lastName: r["lname"] ?? "",
        sex: r["sex"] || undefined,
        class: r["class"] || undefined,
        gradeClass: r["gradeclass"] || undefined,
        gradeProgram: r["gradeprogram"] || undefined,
        gradeProgramCode: r["gradeprogramcode"] || undefined,
      })
    }

    // Courses
    if (!courseMap.has(courseId)) {
      courseMap.set(courseId, {
        id: courseId,
        specialization: r["specialization"] || undefined,
        points: parseIntOrNull(r["points"]) ?? 0,
        category: r["category"] || undefined,
      })
    }

    // Enrollment row
    const grade = (r["grade"] || "").trim().toUpperCase() || null
    enrollments.push({
      studentId: sid,
      courseId,
      class: r["class"] || null,
      gradeClass: r["gradeclass"] || null,
      gradeProgram: r["gradeprogram"] || null,
      gradeProgramCode: r["gradeprogramcode"] || null,
      teacher: r["teacher"] || null,
      examType: r["examtype"] || null,
      printDate: parseDateOrNull(r["printdate"]),
      startDate: parseDateOrNull(r["startdate"]),
      endDate: parseDateOrNull(r["enddate"]),
      year: parseIntOrNull(r["year"]),
      status: parseIntOrNull(r["status"]),
      extent: parseIntOrNull(r["extent"]),
      grade,
      gradeDate: parseDateOrNull(r["gradedate"]),
      code: r["code"] || null,
      comment: r["comment"] || null,
      courseWarning: parseIntOrNull(r["coursewarning"]),
      courseDeviation: parseIntOrNull(r["coursedeviation"]),
      studentGrade: parseIntOrNull(r["studentgrade"]),
      active: parseBool(r["active"]),
      showInCatalog: parseBool(r["showincatalog"]),
    })
  }

  // Reset DB each import
  await prisma.$transaction([
    prisma.enrollment.deleteMany({}),
    prisma.course.deleteMany({}),
    prisma.student.deleteMany({}),
  ])

  const students = Array.from(studentMap.values())
  const courses = Array.from(courseMap.values())

  if (students.length) await prisma.student.createMany({ data: students })
  if (courses.length) await prisma.course.createMany({ data: courses })
  if (enrollments.length) await prisma.enrollment.createMany({ data: enrollments })

  return {
    students: students.length,
    courses: courses.length,
    enrollments: enrollments.length,
  }
}

export async function importStudieplanerKurserFromPath(relativePath = "public/StudieplanerKurser.txt") {
  const full = path.join(process.cwd(), relativePath)
  const buf = await readFile(full)
  const text = decodeMaybeLatin1(buf)
  return importStudieplanerKurserFromString(text)
}
