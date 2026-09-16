import { PrismaClient, LaptopStatus, ConditionGrade } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log("[SYS_SEEDING] // Laptop data pipeline initialized...");

  const laptops = [
    {
      brand: "Apple",
      model: "MacBook Pro 16\"",
      processor: "M3 Max",
      ram: 36,
      storage: 1024,
      batteryCycles: 14,
      healthScore: 95,
      conditionGrade: ConditionGrade.VAULT,
      price: 340000,
      status: LaptopStatus.AVAILABLE,
    },
    {
      brand: "ASUS",
      model: "ROG Zephyrus G14",
      processor: "Ryzen 9",
      ram: 32,
      storage: 1024,
      batteryCycles: 0,
      healthScore: 88,
      conditionGrade: ConditionGrade.MINT,
      price: 210000,
      status: LaptopStatus.AVAILABLE,
    },
    {
      brand: "Lenovo",
      model: "ThinkPad X1 Carbon Dev Edition",
      processor: "Core i7",
      ram: 16,
      storage: 512,
      batteryCycles: 85,
      healthScore: 72,
      conditionGrade: ConditionGrade.GOOD,
      price: 95000,
      status: LaptopStatus.AVAILABLE,
    },
    {
      brand: "HP",
      model: "Victus 15",
      processor: "Core i5",
      ram: 8,
      storage: 512,
      batteryCycles: 120,
      healthScore: 25,
      conditionGrade: ConditionGrade.COOKED,
      price: 55000,
      status: LaptopStatus.AVAILABLE,
    },
  ];

  for (const laptop of laptops) {
    const created = await prisma.laptop.create({
      data: {
        ...laptop,
      },
    });
    console.log(`[SYS_SEEDING] // Seeded: ${created.brand} ${created.model} — KSh ${created.price.toLocaleString("en-KE")}`);
  }

  const count = await prisma.laptop.count();
  console.log(`[SYS_SEEDING] // Complete — ${count} laptop(s) in inventory.`);
}

main()
  .catch((e) => {
    console.error("[SYS_SEEDING] // FATAL ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("[SYS_SEEDING] // Prisma connection pool closed.");
  });
