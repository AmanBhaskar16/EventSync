
import { prisma } from "../src/lib/db/prisma";
import bcrypt from "bcryptjs";
import "dotenv/config";

// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("Demo@1234", 12);

  // Customer
  const customer = await prisma.user.upsert({
    where:  { email: "customer@demo.com" },
    update: {},
    create: {
      name:         "Demo Customer",
      email:        "customer@demo.com",
      phone:        "9876543210",
      passwordHash: hash,
      role:         "CUSTOMER",
      customer:     { create: {} },
    },
  });

  // Vendor
  const vendor = await prisma.user.upsert({
    where:  { email: "vendor@demo.com" },
    update: {},
    create: {
      name:         "Demo Vendor",
      email:        "vendor@demo.com",
      phone:        "9876543211",
      passwordHash: hash,
      role:         "VENDOR",
      vendor: {
        create: {
          businessName:  "Demo Caterers",
          category:      "CATERING",
          city:          "Mumbai",
          state:         "Maharashtra",
          pincode:       "400001",
          kycStatus:     "APPROVED",
          isVerified:    true,
          serviceRadius: 50,
        },
      },
    },
  });

  // Admin
  const admin = await prisma.user.upsert({
    where:  { email: "admin@demo.com" },
    update: {},
    create: {
      name:         "Demo Admin",
      email:        "admin@demo.com",
      phone:        "9876543212",
      passwordHash: hash,
      role:         "ADMIN",
      admin:        { create: {} },
    },
  });

  console.log("Seeded:", customer.email, vendor.email, admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());