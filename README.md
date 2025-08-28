# Betygsprognos

Ett webbgränssnitt byggt med **Next.js**, **Shadcn UI**, **Prisma** och **SQLite**.  
Syftet med projektet är att ge **skolledare** ett lokalt och användarvänligt verktyg för att generera **examensprognoser** baserade på data från **SchoolSoft**.  
Systemet kan läsa in `.txt`-filer från SchoolSoft och presentera prognoser på ett tydligt och interaktivt sätt.

---

## 🚀 Funktionalitet

- **Import av .txt-filer**  
  Användare kan ladda upp SchoolSoft-exporter i `.txt`-format.  
  Systemet parsar filerna och lagrar relevant data lokalt i en SQLite-databas.

- **Generering av examensprognoser**  
  Verktyget beräknar sannolikheten för att elever tar examen baserat på inläst betygsdata.

- **Webbgränssnitt för skolledare**  
  Skolledare får ett enkelt och visuellt gränssnitt för att:
  - Se statistik och prognoser
  - Filtrera på program, klass och enskilda elever
  - Exportera resultat i olika format (CSV, PDF – planerad funktionalitet)

- **Lokal databas**  
  All data sparas lokalt i SQLite för att:
  - Skydda känslig elevdata
  - Slippa extern serverdrift
  - Förenkla installation och användning

---

## 🛠️ Teknisk stack

- **Next.js 15 (App Router + Turbopack)** – frontend & serverkomponenter
- **TypeScript** – strikt typning
- **TailwindCSS + Shadcn UI** – modern och flexibel UI-komponentbas
- **Prisma ORM** – databasmodellering
- **SQLite** – lokal datalagring
- **Node.js 22** – runtime

---

## 📂 Projektstruktur