"use client"

import React, { useState } from "react"

type Fail = { courseId: string; points: number; teacher: string | null; gradeDate: string | null }
type Row = {
  studentId: number
  name: string
  class?: string | null
  totalFailPoints: number
  failCount: number
  fails: Fail[]
}

export default function MathTable({ rows }: { rows: Row[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({})
  const toggle = (id: number) => setOpen((s) => ({ ...s, [id]: !s[id] }))

  const courseList = (r: Row) => Array.from(new Set(r.fails.map(f => f.courseId))).join(", ") || "-"

  if (!rows.length) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="py-6 text-gray-500">Inga elever matchar kriteriet just nu.</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 border-b">
            <th className="py-2 pr-4">Elev</th>
            <th className="py-2 pr-4">Klass</th>
            <th className="py-2 pr-4">Kurs(er)</th>
            <th className="py-2 pr-4">F‑kurser</th>
            <th className="py-2 pr-4">F‑poäng</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <React.Fragment key={r.studentId}>
              <tr className="border-b last:border-0">
                <td className="py-2 pr-4">
                  <button
                    onClick={() => toggle(r.studentId)}
                    className="underline underline-offset-2 hover:no-underline"
                    title="Visa F‑kurser"
                  >
                    {r.name}
                  </button>
                </td>
                <td className="py-2 pr-4">{r.class ?? "-"}</td>
                <td className="py-2 pr-4">{courseList(r)}</td>
                <td className="py-2 pr-4">{r.failCount}</td>
                <td className="py-2 pr-4 font-medium">{r.totalFailPoints}</td>
              </tr>
              {open[r.studentId] && (
                <tr className="bg-purple-50/50 border-b last:border-0">
                  <td colSpan={5} className="py-3 px-4">
                    {r.fails.length ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left text-gray-600">
                              <th className="py-1 pr-3">Kurs</th>
                              <th className="py-1 pr-3">Poäng</th>
                              <th className="py-1 pr-3">Satt av</th>
                              <th className="py-1 pr-3">Datum</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.fails
                              .slice()
                              .sort((a, b) => (b.gradeDate ?? "").localeCompare(a.gradeDate ?? ""))
                              .map((f, i) => (
                                <tr key={`${r.studentId}-${f.courseId}-${i}`} className="text-gray-800">
                                  <td className="py-1 pr-3 font-medium">{f.courseId}</td>
                                  <td className="py-1 pr-3">{f.points}</td>
                                  <td className="py-1 pr-3">{f.teacher ?? "-"}</td>
                                  <td className="py-1 pr-3">{f.gradeDate ?? "-"}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-gray-600 text-xs">Inga detaljer hittades.</div>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

