"use client"

import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { importSampleAction, uploadFileAction } from "@/app/actions"

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
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-black/80"
    >
      {pending ? "Arbetar…" : children}
    </button>
  )
}

export default function ImportClient() {
  const [uploadState, uploadAction] = useActionState<ImportState, FormData>(uploadFileAction, {})
  const [sampleState, sampleAction] = useActionState<ImportState, FormData>(importSampleAction, {})

  return (
    <>
      <section className="w-full">
        <h1 className="text-2xl font-semibold mb-2">Ladda upp SchoolSoft-fil</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Välj en <code>.txt</code>-fil exporterad från SchoolSoft.
        </p>

        <form action={uploadAction} className="flex flex-col gap-4">
          <input
            type="file"
            name="file"
            accept=".txt,text/plain"
            required
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
          <SubmitButton>Ladda upp</SubmitButton>
        </form>

        {(uploadState?.success || uploadState?.error) && (
          <div className="mt-3 text-sm">
            {uploadState.error ? (
              <p className="text-red-600">Fel: {uploadState.error}</p>
            ) : (
              <p className="text-green-700">
                Import klart. Studenter: {uploadState.students ?? 0}, Kurser: {uploadState.courses ?? 0}, Läsningar: {uploadState.enrollments ?? 0}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="w-full">
        <h2 className="text-xl font-semibold mt-8 mb-2">Eller importera demo-fil</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Använd <code>public/StudieplanerKurser.txt</code> som exempeldata.
        </p>
        <form action={sampleAction}>
          <SubmitButton>Importera demo-fil</SubmitButton>
        </form>
        {(sampleState?.success || sampleState?.error) && (
          <div className="mt-3 text-sm">
            {sampleState.error ? (
              <p className="text-red-600">Fel: {sampleState.error}</p>
            ) : (
              <p className="text-green-700">
                Import klart. Studenter: {sampleState.students ?? 0}, Kurser: {sampleState.courses ?? 0}, Läsningar: {sampleState.enrollments ?? 0}
              </p>
            )}
          </div>
        )}
      </section>
    </>
  )
}
