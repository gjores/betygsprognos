"use client"

import React, { useState } from "react"
import { useActionState } from "react"
import { computeHeadOverview, clearAllData } from "@/app/actions"
import { Button } from "@/components/ui/button"

type ResultRow = { school: string; total: number; atRisk: number; pct: number }
type State = { success?: boolean; results?: ResultRow[]; errors?: string[] }

export default function HeadClient() {
  const [rows, setRows] = useState<Array<{ key: string }>>([{ key: crypto.randomUUID() }])
  const [state, action] = useActionState<State, FormData>(computeHeadOverview, {})
  const [clearState, clearAction] = useActionState<any, FormData>(clearAllData, {})

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="threshold" className="block text-xs text-gray-600">Tröskel (F‑poäng)</label>
            <input id="threshold" name="threshold" type="number" defaultValue={250} className="border rounded px-2 py-1 text-sm w-28" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="activeOnly" value="1" /> Endast aktiva läsningar
          </label>
          <Button type="submit" variant="default">Beräkna</Button>
        </div>

        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={r.key} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded">
              <div>
                <label className="block text-xs text-gray-600">Skolnamn</label>
                <input name="schoolName" placeholder={`Skola ${i + 1}`} className="border rounded px-2 py-1 w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">XML‑fil</label>
                <input name="schoolFile" type="file" accept=".xml,application/xml,text/xml" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setRows(rs => [...rs, { key: crypto.randomUUID() }])}>
            Lägg till skola
          </Button>
          {rows.length > 1 && (
            <Button type="button" variant="secondary" onClick={() => setRows(rs => rs.slice(0, -1))}>
              Ta bort sista
            </Button>
          )}
        </div>
      </form>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">Underhåll</div>
        <form
          action={clearAction}
          onSubmit={(e) => {
            if (!confirm("Är du säker på att du vill radera ALL data? Detta går inte att ångra.")) {
              e.preventDefault()
            } else {
              // small info after submit
              setTimeout(() => alert("All data raderad."), 0)
            }
          }}
        >
          <Button type="submit" variant="destructive">Radera all data</Button>
        </form>
      </div>

      {clearState?.ok && (
        <div className="text-sm text-green-700">Databasen rensad.</div>
      )}

      {(state?.errors && state.errors.length > 0) && (
        <div className="text-sm text-red-700">
          {state.errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      {(state?.results && state.results.length > 0) && (
        <div className="space-y-3">
          {state.results.map((r) => (
            <div key={r.school} className="border rounded p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{r.school || "(namnlös)"}</div>
                <div className="text-sm text-gray-700">{r.atRisk}/{r.total} · {r.pct}%</div>
              </div>
              <div className="h-2.5 w-full rounded bg-gray-200 overflow-hidden">
                <div className="h-2.5 bg-purple-600" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
