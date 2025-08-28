import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-xl">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <section className="w-full">
          <h1 className="text-2xl font-semibold mb-2">Betygsprognos</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Importera en SchoolSoft-export för att komma igång.
          </p>
          <Link
            href="/import"
            className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-black/80"
          >
            Gå till import
          </Link>
        </section>
      </main>
    </div>
  );
}
