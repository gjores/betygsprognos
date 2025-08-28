export const runtime = "nodejs"

import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import FailTable from "../f150/table"

type Row = {
  studentId: number
  name: string
  class?: string | null
  totalFailPoints: number
  failCount: number
  fails: { courseId: string; points: number; teacher: string | null; gradeDate: string | null }[]
}

async function getData(): Promise<Row[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      grade: "F",
      OR: [
        { courseId: { startsWith: "SVESVE" } }, // Svenska
        { courseId: { startsWith: "SVASVA" } }, // Svenska som andraspråk
      ],
    },
    include: { student: true, course: true },
  })

  const map = new Map<number, Row>()
  for (const e of enrollments) {
    const key = e.studentId
    const points = e.course?.points ?? 0
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
    const row = map.get(key)!
    row.totalFailPoints += points
    row.failCount += 1
    row.fails.push({
      courseId: e.course?.id ?? e.courseId,
      points,
      teacher: e.teacher ?? null,
      gradeDate: e.gradeDate ? new Date(e.gradeDate).toISOString().slice(0, 10) : null,
    })
  }

  const rows = Array.from(map.values())
  rows.sort((a, b) => b.totalFailPoints - a.totalFailPoints)
  return rows
}

export default async function StudentsSvenskaPage() {
  const rows = await getData()
  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 bg-gray-50">
      <main className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Elever med F i Svenska/SVA</CardTitle>
            <CardDescription>
              Visar elever som har underkänt i Svenska och/eller Svenska som andraspråk.
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

