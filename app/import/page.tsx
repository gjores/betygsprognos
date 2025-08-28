export const runtime = "nodejs"
import ImportClient from "./ImportClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ImportPage() {
  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 bg-gray-50">
      <main className="mx-auto w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Importera data</CardTitle>
            <CardDescription>Välj en SchoolSoft‑export eller använd demo‑filen.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImportClient />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
