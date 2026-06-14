import { PrismaClient } from "@prisma/client";
import { seedPromoCodes } from "../prisma/seed/promo-codes";

const db = new PrismaClient();

seedPromoCodes(db)
  .then(() => console.log("Promo codes seeded."))
  .catch(console.error)
  .finally(() => db.$disconnect());
