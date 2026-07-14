import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type CategorySeed = {
  name: string;
  slug: string;
  subcategories: { name: string; slug: string }[];
};

const categories: CategorySeed[] = [
  {
    name: "Plumbing",
    slug: "plumbing",
    subcategories: [
      { name: "Pipe Installation", slug: "pipe-installation" },
      { name: "Drain Cleaning", slug: "drain-cleaning" },
      { name: "Water Heater Repair", slug: "water-heater-repair" },
      { name: "Water Tank Installation", slug: "water-tank-installation" },
      { name: "Toilet Repair", slug: "toilet-repair" },
    ],
  },
  {
    name: "Electrical",
    slug: "electrical",
    subcategories: [
      { name: "Wiring", slug: "wiring" },
      { name: "Solar Installation", slug: "solar-installation" },
      { name: "CCTV Installation", slug: "cctv-installation" },
      { name: "Alarm Systems", slug: "alarm-systems" },
      { name: "Appliance Repair", slug: "electrical-appliance-repair" },
    ],
  },
  {
    name: "Carpentry & Woodwork",
    slug: "carpentry-woodwork",
    subcategories: [
      { name: "Custom Furniture", slug: "custom-furniture" },
      { name: "Cabinet Installation", slug: "cabinet-installation" },
      { name: "Door/Window Repair", slug: "door-window-repair" },
      { name: "Wardrobe Building", slug: "wardrobe-building" },
    ],
  },
  {
    name: "Masonry & Tiling",
    slug: "masonry-tiling",
    subcategories: [
      { name: "Tiling", slug: "tiling" },
      { name: "Wall Repair", slug: "wall-repair" },
      { name: "Plastering", slug: "plastering" },
      { name: "Painting", slug: "painting" },
    ],
  },
  {
    name: "Cleaning",
    slug: "cleaning",
    subcategories: [
      { name: "Home Cleaning", slug: "home-cleaning" },
      { name: "Office Cleaning", slug: "office-cleaning" },
      { name: "Deep Cleaning", slug: "deep-cleaning" },
      {
        name: "Post-Construction Cleaning",
        slug: "post-construction-cleaning",
      },
    ],
  },
  {
    name: "Appliance Repair",
    slug: "appliance-repair",
    subcategories: [
      { name: "Washing Machine Repair", slug: "washing-machine-repair" },
      { name: "Fridge/Freezer Repair", slug: "fridge-freezer-repair" },
      { name: "Cooker/Oven Repair", slug: "cooker-oven-repair" },
    ],
  },
  {
    name: "Interior Design & Renovation",
    slug: "interior-design-renovation",
    subcategories: [
      { name: "Space Planning", slug: "space-planning" },
      { name: "Renovation", slug: "renovation" },
      { name: "Remodeling", slug: "remodeling" },
    ],
  },
  {
    name: "TV Mounting & Home Tech",
    slug: "tv-mounting-home-tech",
    subcategories: [
      { name: "TV Mounting", slug: "tv-mounting" },
      { name: "Home Theatre Setup", slug: "home-theatre-setup" },
      { name: "Smart Home Installation", slug: "smart-home-installation" },
    ],
  },
];

async function main() {
  for (const category of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: { name: category.name, slug: category.slug },
    });

    for (const sub of category.subcategories) {
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, parentId: parent.id },
        create: { name: sub.name, slug: sub.slug, parentId: parent.id },
      });
    }

    console.log(
      `Seeded ${category.name} with ${category.subcategories.length} subcategories`,
    );
  }
}

main()
  .then(async () => {
    console.log("Seeding complete.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
