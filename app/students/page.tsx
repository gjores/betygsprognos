export const runtime = "nodejs"

import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import FiltersClient from "./FiltersClient"

type Row = {
  studentId: number
  name: string
  class?: string | null
  program?: string | null
  fPoints: number
  fCount: number
}

function parseNumberParam(v?: string | null): number | undefined {
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

export default async function StudentsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const q = (searchParams?.q as string | undefined)?.trim()
  const klass = (searchParams?.class as string | undefined)?.trim()
  const program = (searchParams?.program as string | undefined)?.trim()
  const minF = parseNumberParam(searchParams?.minF as string | undefined)
  const maxF = parseNumberParam(searchParams?.maxF as string | undefined)
  const activeOnly = (searchParams?.activeOnly as string | undefined) === "1"

  // Fetch all students (optionally filtered by class/program and q)
  const whereStudent: any = {}
  if (klass) whereStudent.class = klass
  if (program) whereStudent.gradeProgram = program
  if (q) {
    whereStudent.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { socialNumber: { contains: q } },
    ]
  }

  const students = await prisma.student.findMany({
    where: whereStudent,
    select: { id: true, firstName: true, lastName: true, class: true, gradeProgram: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  })

  const studentIds = students.map(s => s.id)

  // Compute F points per student
  const fPointsByStudent = new Map<number, { fPoints: number; fCount: number }>()
  if (studentIds.length) {
    const whereEnroll: any = { studentId: { in: studentIds }, grade: "F" }
    if (activeOnly) whereEnroll.active = true
    const es = await prisma.enrollment.findMany({
      where: whereEnroll,
      select: { studentId: true, course: { select: { points: true } } },
    })
    for (const e of es) {
      const pts = e.course?.points ?? 0
      const cur = fPointsByStudent.get(e.studentId) ?? { fPoints: 0, fCount: 0 }
      cur.fPoints += pts
      cur.fCount += 1
      fPointsByStudent.set(e.studentId, cur)
    }
  }

  // Build rows and apply min/max filters
  let rows: Row[] = students.map(s => {
    const agg = fPointsByStudent.get(s.id) ?? { fPoints: 0, fCount: 0 }
    return {
      studentId: s.id,
      name: `${s.firstName} ${s.lastName}`.trim(),
      class: s.class,
      program: s.gradeProgram,
      fPoints: agg.fPoints,
      fCount: agg.fCount,
    }
  })
  if (typeof minF === "number") rows = rows.filter(r => r.fPoints >= minF)
  if (typeof maxF === "number") rows = rows.filter(r => r.fPoints <= maxF)

  // Distinct options for filters (classes/programs)
  const allMeta = await prisma.student.findMany({ select: { class: true, gradeProgram: true } })
  const classes = Array.from(new Set(allMeta.map(m => m.class).filter((v): v is string => !!v))).sort()
  const programs = Array.from(new Set(allMeta.map(m => m.gradeProgram).filter((v): v is string => !!v))).sort()

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 bg-gray-50">
      <main className="mx-auto w-full max-w-6xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Elever</CardTitle>
            <CardDescription>Filtrera på klass, program, F‑poäng och fritext.</CardDescription>
          </CardHeader>
          <CardContent>
            <FiltersClient classes={classes} programs={programs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultat ({rows.length})</CardTitle>
            <CardDescription>Visar F‑poäng beräknat från kursläsningar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Elev</th>
                    <th className="py-2 pr-4">Klass</th>
                    <th className="py-2 pr-4">Program</th>
                    <th className="py-2 pr-4">F‑kurser</th>
                    <th className="py-2 pr-4">F‑poäng</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-gray-500">Inga elever matchar filtret.</td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.studentId} className="border-b last:border-0">
                        <td className="py-2 pr-4">{r.name}</td>
                        <td className="py-2 pr-4">{r.class ?? "-"}</td>
                        <td className="py-2 pr-4">{r.program ?? "-"}</td>
                        <td className="py-2 pr-4">{r.fCount}</td>
                        <td className="py-2 pr-4 font-medium">{r.fPoints}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

