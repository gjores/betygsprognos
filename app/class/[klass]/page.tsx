export const runtime = "nodejs"

import prisma from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import FailTable from "@/app/students/f150/table"

type Fail = { courseId: string; points: number; teacher: string | null; gradeDate: string | null }
type Row = {
  studentId: number
  name: string
  class?: string | null
  totalFailPoints: number
  failCount: number
  fails: Fail[]
}

function parseBool(v?: string | string[]): boolean {
  if (!v) return false
  const s = Array.isArray(v) ? v[0] : v
  return s === "1" || s.toLowerCase() === "true"
}

async function getData(klass: string, activeOnly: boolean): Promise<Row[]> {
  const whereStudent: any = {}
  if (klass === "-") whereStudent.class = null
  else whereStudent.class = klass

  const students = await prisma.student.findMany({ where: whereStudent })
  const ids = students.map((s) => s.id)
  if (ids.length === 0) return []

  const whereEnroll: any = { studentId: { in: ids }, grade: "F" }
  if (activeOnly) whereEnroll.active = true
  const enrollments = await prisma.enrollment.findMany({
    where: whereEnroll,
    include: { course: true },
  })

  const map = new Map<number, Row>()
  for (const s of students) {
    map.set(s.id, {
      studentId: s.id,
      name: `${s.firstName} ${s.lastName}`.trim(),
      class: s.class ?? null,
      totalFailPoints: 0,
      failCount: 0,
      fails: [],
    })
  }

  for (const e of enrollments) {
    const row = map.get(e.studentId)
    if (!row) continue
    const pts = e.course?.points ?? 0
    row.totalFailPoints += pts
    row.failCount += 1
    row.fails.push({
      courseId: e.course?.id ?? e.courseId,
      points: pts,
      teacher: e.teacher ?? null,
      gradeDate: e.gradeDate ? new Date(e.gradeDate).toISOString().slice(0, 10) : null,
    })
  }

  const rows = Array.from(map.values())
  rows.sort((a, b) => b.totalFailPoints - a.totalFailPoints)
  return rows
}

export default async function ClassPage({ params, searchParams }: { params: { klass: string }; searchParams?: Record<string, string | string[] | undefined> }) {
  const klassParam = decodeURIComponent(params.klass)
  const activeOnly = parseBool(searchParams?.activeOnly)
  const rows = await getData(klassParam, activeOnly)

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 bg-gray-50">
      <main className="mx-auto w-full max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Klass {klassParam}</CardTitle>
            <CardDescription>
              Elevernas F‑betyg i klassen{activeOnly ? " (endast aktiva läsningar)" : ""}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={`/class/${encodeURIComponent(klassParam)}`} className="mb-4 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="activeOnly" value="1" defaultChecked={activeOnly} />
                Endast aktiva läsningar
              </label>
              <button className="inline-flex items-center rounded-md bg-gray-900 text-white px-3 py-1.5 text-sm">Uppdatera</button>
              <Link href="/" className="text-sm text-gray-700 hover:underline">Tillbaka till översikt</Link>
            </form>
            <FailTable rows={rows} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

