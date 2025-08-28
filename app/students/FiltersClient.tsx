"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type Option = { value: string; label: string }

export default function FiltersClient({
  classes,
  programs,
}: {
  classes: string[]
  programs: string[]
}) {
  const sp = useSearchParams()
  const defaults = useMemo(() => {
    return {
      q: sp.get("q") ?? "",
      class: sp.get("class") ?? "",
      program: sp.get("program") ?? "",
      minF: sp.get("minF") ?? "",
      maxF: sp.get("maxF") ?? "",
      activeOnly: sp.get("activeOnly") === "1",
    }
  }, [sp])

  const classOptions: Option[] = [{ value: "", label: "Alla" }, ...classes.map(c => ({ value: c, label: c }))]
  const programOptions: Option[] = [{ value: "", label: "Alla" }, ...programs.map(p => ({ value: p, label: p }))]

  return (
    <form method="get" className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
      <div className="md:col-span-2 grid gap-1.5">
        <Label htmlFor="q">Sök</Label>
        <Input id="q" name="q" defaultValue={defaults.q} placeholder="Namn eller personnummer" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="class">Klass</Label>
        <select id="class" name="class" defaultValue={defaults.class} className="h-10 rounded-md border bg-white px-3 text-sm">
          {classOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="program">Program</Label>
        <select id="program" name="program" defaultValue={defaults.program} className="h-10 rounded-md border bg-white px-3 text-sm">
          {programOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="minF">Min F‑poäng</Label>
        <Input id="minF" name="minF" type="number" min={0} defaultValue={defaults.minF} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="maxF">Max F‑poäng</Label>
        <Input id="maxF" name="maxF" type="number" min={0} defaultValue={defaults.maxF} />
      </div>
      <div className="flex items-center gap-2 md:justify-self-start">
        <input id="activeOnly" name="activeOnly" type="checkbox" value="1" defaultChecked={defaults.activeOnly} />
        <Label htmlFor="activeOnly">Bara aktiva läsningar</Label>
      </div>
      <div className="md:col-span-6 flex items-center gap-2">
        <Button type="submit">Filtrera</Button>
        <a href="/students" className="text-sm text-gray-600 hover:underline">Rensa</a>
      </div>
    </form>
  )
}

