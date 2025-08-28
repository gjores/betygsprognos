export const runtime = "nodejs"

import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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
      })
    }
    const entry = map.get(key)!
    entry.totalFailPoints += points
    entry.failCount += 1
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Elev</th>
                    <th className="py-2 pr-4">Klass</th>
                    <th className="py-2 pr-4">F‑kurser</th>
                    <th className="py-2 pr-4">F‑poäng</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-gray-500">Inga elever matchar kriteriet just nu.</td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.studentId} className="border-b last:border-0">
                        <td className="py-2 pr-4">{r.name}</td>
                        <td className="py-2 pr-4">{r.class ?? "-"}</td>
                        <td className="py-2 pr-4">{r.failCount}</td>
                        <td className="py-2 pr-4 font-medium">{r.totalFailPoints}</td>
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

