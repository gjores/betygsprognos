export const runtime = "nodejs"

import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ClassRisk = {
  className: string
  total: number
  atRisk: number
  pct: number
}

function parseNumberParam(v?: string | null): number | undefined {
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

async function getOverview(thresholdPoints: number, activeOnly: boolean): Promise<{ hasData: boolean; rows: ClassRisk[] }> {
  const hasData = (await prisma.enrollment.count()) > 0
  if (!hasData) return { hasData, rows: [] }

  const students = await prisma.student.findMany({
    select: { id: true, class: true },
  })
  const byClass = new Map<string, number[]>()
  for (const s of students) {
    const cls = (s.class ?? "-").trim()
    if (!byClass.has(cls)) byClass.set(cls, [])
    byClass.get(cls)!.push(s.id)
  }

  const allIds = students.map(s => s.id)
  const whereEnroll: any = { studentId: { in: allIds }, grade: "F" }
  if (activeOnly) whereEnroll.active = true
  const enrolls = await prisma.enrollment.findMany({
    where: whereEnroll,
    select: { studentId: true, courseId: true, course: { select: { points: true } } },
  })
  const fPoints = new Map<number, number>()
  const criticalF = new Map<number, boolean>()
  for (const e of enrolls) {
    const prev = fPoints.get(e.studentId) ?? 0
    fPoints.set(e.studentId, prev + (e.course?.points ?? 0))

    const cid = (e.courseId ?? "").toUpperCase()
    const isCritical =
      cid.startsWith("SVESVE") || // Svenska
      cid.startsWith("SVASVA") || // Svenska som andraspråk
      cid.startsWith("ENGENG") || // Engelska
      cid === "MATMAT01B" ||
      cid === "MATMAT01C"
    if (isCritical) criticalF.set(e.studentId, true)
  }

  const rows: ClassRisk[] = []
  for (const [cls, ids] of byClass) {
    const total = ids.length
    if (total === 0) continue
    let atRisk = 0
    for (const id of ids) {
      const pts = fPoints.get(id) ?? 0
      const isCrit = criticalF.get(id) === true
      if (pts > thresholdPoints || isCrit) atRisk++
    }
    const pct = Math.round((atRisk / total) * 1000) / 10 // 1 decimal
    rows.push({ className: cls, total, atRisk, pct })
  }

  rows.sort((a, b) => b.pct - a.pct)
  return { hasData: true, rows }
}

function riskHue(pct: number): number {
  // Map 0% -> green (120deg), 100% -> red (0deg)
  const clamped = Math.max(0, Math.min(100, pct))
  return Math.round(120 - clamped * 1.2) // 120..0
}
function riskColor(pct: number): string {
  const hue = riskHue(pct)
  return `hsl(${hue}deg 85% 45%)`
}
function riskBg(pct: number): string {
  const hue = riskHue(pct)
  return `hsl(${hue}deg 90% 95%)`
}
function riskBorder(pct: number): string {
  const hue = riskHue(pct)
  return `hsl(${hue}deg 60% 70%)`
}

export default async function Home({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const threshold = parseNumberParam(searchParams?.threshold as string | undefined) ?? 250
  const activeOnly = (searchParams?.activeOnly as string | undefined) === "1"
  const { hasData, rows } = await getOverview(threshold, activeOnly)

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 bg-gray-50">
      <main className="mx-auto w-full max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Betygsprognos</CardTitle>
            <CardDescription>
              Importera SchoolSoft‑exporter och få överblick över risk för ej examen per klass.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Link href="/import" className={cn(buttonVariants({ variant: "default" }))}>
                Importera data
              </Link>
              <Link href="/demo" className="text-sm text-gray-600 hover:underline">
                förhandsgranska demodata
              </Link>
                            <a href="/api/report" target="_blank" className={cn(buttonVariants({ variant: "secondary" }))}>
                  Ladda ned rapport (PDF)
                </a>
              </div>
          </CardContent>
        </Card>

        {!hasData ? (
          <Card>
            <CardHeader>
              <CardTitle>Inga importerade rader ännu</CardTitle>
              <CardDescription>Ladda upp en SchoolSoft‑export under Import.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Link href="/import" className={cn(buttonVariants({ variant: "default" }))}>Importera</Link>
                <Link href="/demo" className="text-sm text-gray-600 hover:underline">Visa demodata</Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Andel i riskzonen per klass</CardTitle>
                <CardDescription>
                  Andel elever med F‑poäng över {threshold}p eller F i Svenska/SVA/Engelska eller Matematik 1b/1c
                  {activeOnly ? " (endast aktiva läsningar)" : ""}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action="/" className="mb-4 flex flex-wrap gap-3 items-end">
                  <div>
                    <label htmlFor="threshold" className="block text-xs text-gray-600">Tröskel (F‑poäng)</label>
                    <input id="threshold" name="threshold" type="number" defaultValue={threshold}
                      className="border rounded px-2 py-1 text-sm w-28" />
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" name="activeOnly" value="1" defaultChecked={activeOnly} />
                    Endast aktiva läsningar
                  </label>
                  <button className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>Uppdatera</button>
                </form>

                <div className="space-y-3">
                  {rows.map((r) => {
                    const color = riskColor(r.pct)
                    const bg = riskBg(r.pct)
                    const border = riskBorder(r.pct)
                    return (
                      <div
                        key={r.className}
                        className="border rounded-md p-3"
                        style={{ backgroundColor: bg, borderColor: border }}
                      >
                        <div className="flex items-center justify-between mb-2 gap-3">
                          <div className="font-semibold text-base md:text-lg flex-1">
                            <Link href={`/class/${encodeURIComponent(r.className)}`} className="hover:underline">
                              {r.className}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-800 whitespace-nowrap">
                            {r.atRisk}/{r.total} · <span style={{ color }}>{r.pct}%</span>
                          </div>
                        </div>
                        <div className="h-2.5 w-full rounded bg-gray-200/70 overflow-hidden">
                          <div className="h-2.5" style={{ width: `${r.pct}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
