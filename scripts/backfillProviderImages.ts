import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClerkClient } from "@clerk/backend";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

async function main() {
  const providers = await prisma.provider.findMany({
    where: { imageUrl: null },
  });

  for (const provider of providers) {
    try {
      const clerkUser = await clerk.users.getUser(provider.clerkUserId);
      if (clerkUser.imageUrl) {
        await prisma.provider.update({
          where: { id: provider.id },
          data: { imageUrl: clerkUser.imageUrl },
        });
        console.log(`Backfilled ${provider.name}`);
      }
    } catch (err) {
      console.error(`Failed for provider ${provider.id}`, err);
    }
  }
}

main().then(() => prisma.$disconnect());
