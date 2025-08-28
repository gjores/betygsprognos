"use client"

import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { importSampleAction, uploadFileAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  const [uploadState, uploadAction] = useActionState<ImportState, FormData>(uploadFileAction, {})
  const [sampleState, sampleAction] = useActionState<ImportState, FormData>(importSampleAction, {})

  return (
    <>
      <section className="w-full">
        <h1 className="text-2xl font-semibold mb-2">Ladda upp SchoolSoft‑fil</h1>
        <p className="text-sm text-muted-foreground mb-4">Välj en .txt‑fil exporterad från SchoolSoft.</p>

        <form action={uploadAction} className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label htmlFor="file">Fil</Label>
            <Input id="file" type="file" name="file" accept=".txt,text/plain" required />
          </div>
          <SubmitButton>Ladda upp</SubmitButton>
        </form>

        {(uploadState?.success || uploadState?.error) && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            {uploadState.error ? (
              <>
                <AlertTitle className="text-red-700">Fel</AlertTitle>
                <AlertDescription className="text-red-700">{uploadState.error}</AlertDescription>
              </>
            ) : (
              <>
                <AlertTitle className="text-green-800">Import klart</AlertTitle>
                <AlertDescription className="text-green-800">
                  Studenter: {uploadState.students ?? 0}, Kurser: {uploadState.courses ?? 0}, Läsningar: {uploadState.enrollments ?? 0}
                </AlertDescription>
              </>
            )}
          </Alert>
        )}
      </section>

      <section className="w-full">
        <h2 className="text-xl font-semibold mt-8 mb-2">Eller importera demo-fil</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Använd <code>public/StudieplanerKurser.txt</code> som exempeldata.
        </p>
        <form action={sampleAction} className="mt-2">
          <SubmitButton>Importera demo‑fil</SubmitButton>
        </form>
        {(sampleState?.success || sampleState?.error) && (
          <Alert className="mt-4 border-blue-200 bg-blue-50">
            {sampleState.error ? (
              <>
                <AlertTitle className="text-red-700">Fel</AlertTitle>
                <AlertDescription className="text-red-700">{sampleState.error}</AlertDescription>
              </>
            ) : (
              <>
                <AlertTitle className="text-blue-800">Import klart</AlertTitle>
                <AlertDescription className="text-blue-800">
                  Studenter: {sampleState.students ?? 0}, Kurser: {sampleState.courses ?? 0}, Läsningar: {sampleState.enrollments ?? 0}
                </AlertDescription>
              </>
            )}
          </Alert>
        )}
      </section>
    </>
  )
}
