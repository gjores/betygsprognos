export const runtime = "nodejs"

import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import FailTable from "./table"

async function getData() {
  const enrollments = await prisma.enrollment.findMany({
    where: { grade: "F" },
    include: { student: true, course: true },
  })

  const map = new Map<number, {
    studentId: number
    name: string
    class?: string | null
    totalFailPoints: number
    failCount: number
    fails: { courseId: string; points: number; teacher: string | null; gradeDate: string | null }[]
  }>()

  for (const e of enrollments) {
    const points = e.course?.points ?? 0
    const key = e.studentId
    if (!map.has(key)) {
      map.set(key, {
        studentId: key,
        name: `${e.student.firstName} ${e.student.lastName}`.trim(),
        class: e.student.class ?? null,
        totalFailPoints: 0,
        failCount: 0,
        fails: [],
      })
    }
    const entry = map.get(key)!
    entry.totalFailPoints += points
    entry.failCount += 1
    entry.fails.push({
      courseId: e.course?.id ?? "",
      points: points,
      teacher: e.teacher ?? null,
      gradeDate: e.gradeDate ? new Date(e.gradeDate).toISOString().slice(0, 10) : null,
    })
  }

  const rows = Array.from(map.values()).filter(r => r.totalFailPoints > 150)
  rows.sort((a, b) => b.totalFailPoints - a.totalFailPoints)
  return rows
}

export default async function StudentsF150Page() {
  const rows = await getData()
  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 bg-gray-50">
      <main className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Elever med mer än 150p F</CardTitle>
            <CardDescription>
              Summering av F‑betygspäng per elev, filtrerat på &gt; 150 poäng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FailTable rows={rows} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
