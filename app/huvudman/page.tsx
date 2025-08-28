export const runtime = "nodejs"

import HeadClient from "./HeadClient"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function HuvudmanPage() {
  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 bg-gray-50">
      <main className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Huvudmanna‑översikt</CardTitle>
            <CardDescription>Ladda upp flera XML‑filer (en per skola) och ange skolnamn för att se risk per skola.</CardDescription>
          </CardHeader>
          <CardContent>
            <HeadClient />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

