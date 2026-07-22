import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveProviderImage } from "../lib/resolveProviderImage";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const providers = await prisma.provider.findMany({
    where: { imageUrl: null },
  });

  for (const provider of providers) {
    const resolved = await resolveProviderImage(provider.clerkUserId, null);
    if (resolved) {
      await prisma.provider.update({
        where: { id: provider.id },
        data: { imageUrl: resolved },
      });
      console.log(`Backfilled ${provider.name}`);
    }
  }
}

main().then(() => prisma.$disconnect());
