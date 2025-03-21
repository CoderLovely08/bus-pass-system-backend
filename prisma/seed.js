import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clean up existing data
  await prisma.conductorScan.deleteMany({});
  await prisma.busPass.deleteMany({});
  await prisma.passApproval.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.passApplication.deleteMany({});
  await prisma.passType.deleteMany({});
  await prisma.systemUsersInfo.deleteMany({});
  await prisma.userType.deleteMany({});

  // Create user types
  console.log("Creating user types...");
  const passengerType = await prisma.userType.createMany({
    data: {
      name: "Passenger",
      isActive: true,
    },
  });

  const adminType = await prisma.userType.create({
    data: {
      name: "Admin",
      isActive: true,
    },
  });

  const conductorType = await prisma.userType.create({
    data: {
      name: "Conductor",
      isActive: true,
    },
  });

  console.log("Creating User Types...");

  // Create a hashed password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("Pass@1234", salt);

  // Create admin user
  const admin = await prisma.systemUsersInfo.create({
    data: {
      email: "admin@bps.com",
      password: hashedPassword,
      fullName: "Admin User",
      userTypeId: adminType.id,
    },
  });

  console.log("Creating pass types...");
  const passTypes = await prisma.passType.createMany({
    data: [
      {
        name: "Weekly Pass",
        description: "Valid for 7 days from the date of issue",
        durationDays: 7,
        price: 175,
        isActive: true,
      },
      {
        name: "Monthly Pass",
        description: "Valid for 30 days from the date of issue",
        durationDays: 30,
        price: 750,
        isActive: true,
      },
      {
        name: "Quarterly Pass",
        description: "Valid for 90 days from the date of issue",
        durationDays: 90,
        price: 2000,
        isActive: true,
      },
    ],
  });

  console.log("Pass types created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
