import prisma from "@/lib/prisma"

function escapePdf(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

async function getRiskData() {
  const enrollments = await prisma.enrollment.findMany({
    where: { grade: "F" },
    include: { student: true, course: true },
  })
  const map = new Map<number, {
    name: string
    class?: string | null
    total: number
    fails: { id: string; points: number }[]
  }>()
  for (const e of enrollments) {
    const key = e.studentId
    const points = e.course?.points ?? 0
    if (!map.has(key)) {
      map.set(key, {
        name: `${e.student.firstName} ${e.student.lastName}`.trim(),
        class: e.student.class ?? null,
        total: 0,
        fails: [],
      })
    }
    const row = map.get(key)!
    row.total += points
    row.fails.push({ id: e.courseId, points })
  }
  const rows = Array.from(map.values()).filter(r => r.total > 150)
  rows.sort((a,b)=>b.total-a.total)
  return rows
}

async function getCourseFail(prefixes: string[]) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      grade: "F",
      OR: prefixes.map(p => ({ courseId: p.endsWith("*") ? { startsWith: p.slice(0,-1) } : { equals: p } })),
    },
    include: { student: true, course: true },
  })
  const map = new Map<number, { name: string; class?: string | null; fails: string[] }>()
  for (const e of enrollments) {
    const key = e.studentId
    if (!map.has(key)) {
      map.set(key, { name: `${e.student.firstName} ${e.student.lastName}`.trim(), class: e.student.class ?? null, fails: [] })
    }
    map.get(key)!.fails.push(e.courseId)
  }
  const rows = Array.from(map.values())
  rows.sort((a,b)=>a.name.localeCompare(b.name))
  return rows
}

function generatePdf(sections: { title: string; lines: string[] }[]): Uint8Array {
  const lineHeight = 14
  const pageHeight = 842
  const startY = pageHeight - 50
  let stream = "BT\n/F1 12 Tf\n" + `50 ${startY} Td\n`
  for (const sec of sections) {
    stream += `(${escapePdf(sec.title)}) Tj\n0 -${lineHeight} Td\n`
    for (const line of sec.lines) {
      stream += `(${escapePdf(line)}) Tj\n0 -${lineHeight} Td\n`
    }
    stream += `0 -${lineHeight} Td\n`
  }
  stream += "ET"
  const len = Buffer.byteLength(stream, "utf8")

  const objects: string[] = []
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj")
  objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj")
  objects.push("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj")
  objects.push(`4 0 obj << /Length ${len} >> stream\n${stream}\nendstream endobj`)
  objects.push("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj")

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = []
  for (const obj of objects) {
    offsets.push(pdf.length)
    pdf += obj + "\n"
  }
  const xrefPos = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  for (const off of offsets) {
    pdf += off.toString().padStart(10, "0") + " 00000 n \n"
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`
  return Buffer.from(pdf)
}

export async function GET() {
  const risk = await getRiskData()
  const math = await getCourseFail(["MATMAT01B", "MATMAT01C"])
  const swe = await getCourseFail(["SVESVE*", "SVASVA*"])
  const eng = await getCourseFail(["ENGENG*"])

  const sections = [
    {
      title: "Elever med mer än 150p F",
      lines: risk.map(r => `${r.name}${r.class ? ` (${r.class})` : ""}: ` + r.fails.map(f => `${f.id} (${f.points})`).join(", ")),
    },
    {
      title: "F i Matematik 1b/1c",
      lines: math.map(r => `${r.name}${r.class ? ` (${r.class})` : ""}: ` + r.fails.join(", ")),
    },
    {
      title: "F i Svenska/SVA",
      lines: swe.map(r => `${r.name}${r.class ? ` (${r.class})` : ""}: ` + r.fails.join(", ")),
    },
    {
      title: "F i Engelska",
      lines: eng.map(r => `${r.name}${r.class ? ` (${r.class})` : ""}: ` + r.fails.join(", ")),
    },
  ]

  const pdf = generatePdf(sections)
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="rapport.pdf"',
    },
  })
}
