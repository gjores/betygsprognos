import prisma from "../lib/prisma"

async function main() {
  // @ts-expect-error prisma has dynamic keys at runtime
  console.log(Object.keys(prisma))
  // @ts-expect-error prisma has dynamic keys at runtime
  console.log(typeof prisma.enrollment)
}

main().finally(() => process.exit(0))

