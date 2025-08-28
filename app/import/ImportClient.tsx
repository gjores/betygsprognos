"use client"

import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { importPasted, importXMLFile } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

type ImportState = {
  success?: boolean
  error?: string
  students?: number
  courses?: number
  enrollments?: number
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Arbetar…" : children}
    </Button>
  )
}

export default function ImportClient() {
  // Demo-import disabled; linking to /demo instead
  const [pasteState, pasteAction] = useActionState<ImportState, FormData>(importPasted, {})
  const [fileState, fileAction] = useActionState<ImportState, FormData>(importXMLFile, {})

  return (
    <>
      <section className="w-full">
        <h2 className="text-xl font-semibold mb-2">Ladda upp XML‑fil</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Välj SchoolSoft‑export i XML‑format. ISO‑8859‑1 och UTF‑8 stöds.
        </p>
        <form action={fileAction} className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label htmlFor="file">XML‑fil</Label>
            <input id="file" name="file" type="file" accept=".xml,application/xml,text/xml" />
          </div>
          <SubmitButton>Importera XML</SubmitButton>
        </form>

        {(fileState?.success || fileState?.error) && (
          <Alert className="mt-4 border-purple-200 bg-purple-50">
            {fileState.error ? (
              <>
                <AlertTitle className="text-red-700">Fel</AlertTitle>
                <AlertDescription className="text-red-700">{fileState.error}</AlertDescription>
              </>
            ) : (
              <>
                <AlertTitle className="text-purple-800">Import klart</AlertTitle>
                <AlertDescription className="text-purple-800">
                  Studenter: {fileState.students ?? 0}, Kurser: {fileState.courses ?? 0}, Läsningar: {fileState.enrollments ?? 0}
                </AlertDescription>
              </>
            )}
          </Alert>
        )}
      </section>

      <section className="w-full">
        <h2 className="text-xl font-semibold mt-8 mb-2">Visa demodata</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Förhandsgranska filen <code>public/StudieplanerKurser.txt</code> i en egen vy.
        </p>
        <a href="/demo" className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-black/80">
          Öppna demodata
        </a>
      </section>

      <section className="w-full">
        <h2 className="text-xl font-semibold mt-8 mb-2">Klistra in SchoolSoft‑data</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Klistra in hela TSV‑innehållet från SchoolSoft (inklusive header‑raden som börjar med <code>studentid</code>).
        </p>
        <form action={pasteAction} className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label htmlFor="data">Data</Label>
            <Textarea id="data" name="data" spellCheck={false} placeholder="Klistra in TSV här…" />
          </div>
          <SubmitButton>Importera inklistrad data</SubmitButton>
        </form>

        {(pasteState?.success || pasteState?.error) && (
          <Alert className="mt-4 border-purple-200 bg-purple-50">
            {pasteState.error ? (
              <>
                <AlertTitle className="text-red-700">Fel</AlertTitle>
                <AlertDescription className="text-red-700">{pasteState.error}</AlertDescription>
              </>
            ) : (
              <>
                <AlertTitle className="text-purple-800">Import klart</AlertTitle>
                <AlertDescription className="text-purple-800">
                  Studenter: {pasteState.students ?? 0}, Kurser: {pasteState.courses ?? 0}, Läsningar: {pasteState.enrollments ?? 0}
                </AlertDescription>
              </>
            )}
          </Alert>
        )}
      </section>
    </>
  )
}
