# Förslag på förbättringar

Nedan är prioriterade förbättringar för projektet, baserat på en snabb genomgång av kodbasen.

## 1) Dataintegritet och import

- **Lägg till validering av indata vid import** (obligatoriska fält, datumformat, tillåtna betygsvärden).
- **Inför import-rapport** som visar antal ignorerade rader och varför de ignorerades.
- **Minska risk vid full reset av databasen**: dagens import tömmer alla tabeller först. Ersätt gärna med staging-tabell + "swap" eller versionshanterad importkörning.

## 2) Prestanda och skalbarhet

- **Batcha större importer** i chunkar för att minska minnespåverkan och transaktionsstorlek.
- **Lägg till index i Prisma/SQLite** på vanliga filterfält (t.ex. klass, programkod, studentId, grade).
- **Undvik onödigt arbete i UI-lagret** genom att flytta återkommande beräkningar till server/actions.

## 3) Testbarhet och kvalitet

- **Inför enhetstester för parserlogik** (TSV/XML) inklusive edge cases (tomma fält, dubbla lärare, felaktigt XML-innehåll).
- **Lägg till regressionstester för riskberäkning** så kritiska ämnen och poängtrösklar inte ändras oavsiktligt.
- **Utöka CI med lint + typecheck + test** för att fånga fel tidigt.

## 4) Säkerhet och spårbarhet

- **Logga importhändelser** med tidsstämpel, användare, filnamn och summering.
- **Maskera personuppgifter i loggar** för att minska risk kring känslig elevdata.
- **Inför enklare audit trail** för när prognoser har skapats och med vilka parametrar.

## 5) UX och produkt

- **Förhandsgranskning före import**: visa kolumnmappning och valideringsfel innan data skrivs.
- **Tydligare felmeddelanden** i importflödet med konkreta åtgärdsförslag.
- **Exportfunktioner (CSV/PDF)** kan prioriteras utifrån redan nämnda användarbehov i README.

## Snabba vinster (1–2 dagar)

1. Lägg till `npm run typecheck` i scripts och CI.
2. Skriv 5–10 tester för parser/riskberäkning.
3. Visa en enkel importsammanfattning (skapade elever/kurser/poster + antal felrader).
4. Lägg till index i Prisma för de vanligaste filterfrågorna.

## Förslag på prioriteringsordning

1. **Korrekthet först**: validering + tester.
2. **Trygg drift**: importlogg + säkrare importstrategi.
3. **Prestanda**: indexering + batchning.
4. **UX-förbättringar**: förhandsgranskning och bättre felmeddelanden.
