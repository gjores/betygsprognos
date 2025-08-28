import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 bg-gray-50">
      <main className="mx-auto w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Betygsprognos</CardTitle>
            <CardDescription>
              Ladda upp SchoolSoft‑exporter, lagra dem lokalt och få en tydlig prognos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Link href="/import" className={cn(buttonVariants({ variant: "default" }))}>
                Importera data
              </Link>
              <Link href="/import" className="text-sm text-gray-600 hover:underline">
                eller använd demo‑filen
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
