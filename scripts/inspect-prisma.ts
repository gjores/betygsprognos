import prisma from "../lib/prisma"

async function main() {
  // @ts-ignore
  console.log(Object.keys(prisma))
  // @ts-ignore
  console.log(typeof prisma.enrollment)
}

main().finally(() => process.exit(0))

